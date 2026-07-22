// ============================================================
// app.js — 화면 로직 (Rust 엔진을 호출해서 그리기만 한다)
// ============================================================
// 무거운 계산(SHA-256, 채굴, 잔액/체인 검증)은 전부 WASM(Rust)이 한다.
// 이 파일은 그 결과(JSON)를 받아 DOM으로 그리는 일만 담당한다.

import init, {
  WasmEngine,
  WasmUtxo,
  WasmHeaderMiner,
  WasmNetwork,
  WasmDoubleSpend,
  WasmEth,
  sha256,
  pow_try,
  pow_preimage,
  merkle_tree,
  dsha256_steps,
  dbl_spend_probability,
  dbl_spend_simulate,
  eth_keccak256,
  eth_address_from_label,
  evm_run,
} from "./pkg/visual_bitcoin_engine.js";
import { initI18n, t, applyI18n, getLang } from "./i18n.js";
import { setupEth, refreshEth } from "./eth/eth-app.js";

// ---------- 작은 도우미들 ----------
const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Rust의 f64 Display와 동일하게 숫자를 문자열로 (해시 재계산 검증에 사용)
const rustNum = (x) => Number(x).toString();
// 보기용 BTC 금액 포맷
const fmtBtc = (x) => {
  const n = Number(x);
  return Number.isInteger(n) ? n.toString() : n.toFixed(3).replace(/\.?0+$/, "");
};
// 현재 UI 언어에 맞는 로캘 (숫자 구분기호·시간 표기에 사용)
const UI_LOCALE = { ko: "ko-KR", en: "en-US", ja: "ja-JP", es: "es-ES", fr: "fr-FR", de: "de-DE" };
const uiLocale = () => UI_LOCALE[getLang()] || "en-US";
const fmtInt = (x) => Number(x).toLocaleString(uiLocale());
const fmtTime = (unixSecs) => new Date(unixSecs * 1000).toLocaleTimeString(uiLocale());

// 해시 앞쪽의 연속된 0을 강조 표시
function hlLeadingZeros(hash) {
  const m = String(hash).match(/^0+/);
  const z = m ? m[0].length : 0;
  return `<span class="lead0">${hash.slice(0, z)}</span>${esc(hash.slice(z))}`;
}

// 거래 한 건을 Rust의 to_hash_string()과 똑같이 문자열로 (해시 재계산용)
const txToHashString = (tx) => `${tx.from}->${tx.to}:${rustNum(tx.amount)}`;

// ---------- 엔진(Rust) 로그·에러 번역 ----------
// WASM 엔진은 로그/에러를 한국어 문장으로 만든다. 원문을 정규식으로 인식해
// 현재 언어의 log.* 키로 바꿔 그린다. (원문은 저장해 두고 언어 전환 시 다시 번역)
const ENGINE_LOG_PATTERNS = [
  // --- 탭 3: 블록체인 시뮬레이터 ---
  [/^\[INIT\] 제네시스 블록 채굴 중\.\.\.$/, () => t("log.init1")],
  [/^\[INIT\] 제네시스 블록 생성 완료 \(hash: (.+)\.\.\.\)$/, (m) => t("log.init2", { h: m[1] })],
  [
    /^\[난이도 조정\] 최근 (\d+)블록 실제 (\d+)초 \/ 목표 (\d+)초 → (.+) \(난이도 (\d+) → (\d+)\)$/,
    (m) => {
      const v =
        m[4] === "너무 빠르다! 난이도 UP"
          ? t("log.diffUp")
          : m[4] === "너무 느리다! 난이도 DOWN"
          ? t("log.diffDown")
          : t("log.diffKeep");
      return t("log.diffAdj", { n: m[1], a: m[2], e: m[3], v, o: m[5], d: m[6] });
    },
  ],
  [/^\[REJECTED\] 거래 거부! 금액은 0보다 커야 합니다\.$/, () => t("log.rejAmt")],
  [
    /^\[REJECTED\] 거래 거부! (.+) 잔액 부족 \(보유: (.+) BTC, 시도: (.+) BTC\)$/,
    (m) => t("log.rejBal", { from: m[1], bal: m[2], amt: m[3] }),
  ],
  [/^\[TX\] 거래 승인 → 멤풀 대기: (.+)$/, (m) => t("log.txOk", { tx: m[1] })],
  [
    /^\[MINING\] Block #(\d+) 채굴 시작 \(난이도: (\d+), 보상: (.+) BTC, 거래: (\d+)건\)$/,
    (m) => t("log.mining", { id: m[1], d: m[2], r: m[3], n: m[4] }),
  ],
  [
    /^\[MINED\] Block #(\d+) 확정! nonce=(\d+), hash=(.+)\.\.\.$/,
    (m) => t("log.mined", { id: m[1], nonce: m[2], h: m[3] }),
  ],
  // --- 탭 3: 검증 보고서 reason ---
  [/^모든 블록의 해시와 연결이 정상입니다\.$/, () => t("log.vOk")],
  [
    /^Block #(\d+) 해시 불일치! 누군가 거래 데이터를 조작했다\. \(저장:(.+)\.\.\. \/ 재계산:(.+)\.\.\.\)$/,
    (m) => t("log.vHash", { id: m[1], a: m[2], b: m[3] }),
  ],
  [/^Block #(\d+) 체인 연결 끊김!$/, (m) => t("log.vLink", { id: m[1] })],
  [
    /^Block #(\d+) 작업증명 불충족! 해시가 0 (\d+)개로 시작하지 않는다 \(재채굴되지 않은 블록\)\.$/,
    (m) => t("log.vPow", { id: m[1], d: m[2] }),
  ],
  // --- 탭 4: UTXO ---
  [
    /^\[지갑\] '(.+)' 키쌍 생성 → 주소 (.+) \(공개키 (.+)…\)$/,
    (m) => t("log.uWallet", { label: m[1], addr: m[2], pk: m[3] }),
  ],
  [
    /^\[발행\] 코인베이스 → (.+)\((.+)\): (.+) BTC \(새 UTXO (.+):0\)$/,
    (m) => t("log.uFund", { label: m[1], addr: m[2], amt: m[3], txid: m[4] }),
  ],
  [
    /^\[거래\] (.+) → (.+): (.+) BTC \| 서명 검증 ✅ \| 입력 (\d+)개\(합 (.+)\) 소비, 거스름돈 (.+), 수수료 (.+)$/,
    (m) => t("log.uTx", { from: m[1], to: m[2], amt: m[3], n: m[4], sum: m[5], chg: m[6], fee: m[7] }),
  ],
  [
    /^\[위조 거부\] (.+)가 (.+)의 동전을 훔치려 함 → ([\s\S]+)$/,
    (m) => t("log.uForgeRej", { attacker: m[1], victim: m[2], reason: trEngine(m[3]) }),
  ],
  [/^\[경고\] 위조 시도가 검증을 통과했습니다\(공격자=피해자\?\)\.$/, () => t("log.uForgeWarn")],
  // --- 탭 4: 에러 문자열 (SendResult.error / verdict) ---
  [
    /^(.+)의 잔액 부족: 모을 수 있는 건 (.+) BTC인데 (.+) BTC가 필요합니다\.$/,
    (m) => t("log.eVictimBal", { victim: m[1], sum: m[2], need: m[3] }),
  ],
  [
    /^잔액 부족: 모을 수 있는 건 (.+) BTC인데 (.+) BTC가 필요합니다\.$/,
    (m) => t("log.eNoBal", { sum: m[1], need: m[2] }),
  ],
  [/^서명할 입력이 없습니다\.$/, () => t("log.eNoInputs")],
  [
    /^서명한 키의 주소\((.+)\)가 UTXO 소유자 주소\((.+)\)와 다릅니다 → 남의 동전입니다\.$/,
    (m) => t("log.eAddrMismatch", { a: m[1], b: m[2] }),
  ],
  [/^서명이 메시지와 맞지 않습니다\(검증 실패\)\.$/, () => t("log.eSigBad")],
  [/^금액은 0보다 커야 합니다\.$/, () => t("log.eAmt")],
  [/^수수료는 음수가 될 수 없습니다\.$/, () => t("log.eFee")],
  [/^이 경우는 사실상 본인 거래입니다\.$/, () => t("log.eSelf")],
  [/^검증 실패: ([\s\S]+)$/, (m) => t("log.eVerify", { reason: trEngine(m[1]) })],
  [/^검증 실패$/, () => t("log.eVerifyBare")],
  // --- 탭 6: P2P 네트워크 ---
  [
    /^\[네트워크\] 노드 (\d+)개 생성 · 모두 같은 제네시스\((.+)…\)에서 출발$/,
    (m) => t("log.nInit", { n: m[1], h: m[2] }),
  ],
  [
    /^\[채굴\] (.+) 가 블록 #(\d+) 생성\(hash (.+)…\) — 아직 자기만 알고 있음\. 방송해야 퍼진다\.$/,
    (m) => t("log.nMine", { name: m[1], id: m[2], h: m[3] }),
  ],
  [/^\[방송\] (.+) 의 체인이 무효 → 이웃들이 거부$/, (m) => t("log.nCastBad", { name: m[1] })],
  [
    /^\[방송\] (.+) 가 자기 체인\(길이 (\d+)\)을 이웃들에게 전파 📡$/,
    (m) => t("log.nCast", { name: m[1], len: m[2] }),
  ],
  [/^\[거부\] (.+) : 제네시스가 달라 남의 체인으로 취급$/, (m) => t("log.nRejGen", { name: m[1] })],
  [
    /^\[재구성\] (.+) : 더 긴 체인 채택\(길이 (\d+)→(\d+)\) · 내 블록 (\d+)개 버려짐\(orphan\) ⚠️$/,
    (m) => t("log.nReorg", { name: m[1], a: m[2], b: m[3], n: m[4] }),
  ],
  [
    /^\[동기화\] (.+) : 뒤처진 체인을 따라잡음\(길이 (\d+)→(\d+)\)$/,
    (m) => t("log.nSync", { name: m[1], a: m[2], b: m[3] }),
  ],
  [
    /^\[포크 유지\] (.+) : 같은 길이\((\d+)\)의 다른 블록 → 기존 것 유지\. 다음 블록이 승부를 가른다\.$/,
    (m) => t("log.nForkKeep", { name: m[1], len: m[2] }),
  ],
  // --- 탭 7: 이중지불 공격 ---
  [
    /^\[준비\] 제네시스 생성\. 판매자는 결제 후 컨펌 (\d+)개를 기다렸다 노트북을 발송합니다\.$/,
    (m) => t("log.aReady", { n: m[1] }),
  ],
  [/^\[무시\] 이미 결제가 시작됐습니다\. 초기화 후 다시 시도하세요\.$/, () => t("log.aIgnoreStarted")],
  [
    /^\[① 결제\] 공격자 → 판매자 (.+) BTC\(노트북값\) 거래가 공개 체인 블록 #(\d+)에 담김 \(컨펌 1개\)\.$/,
    (m) => t("log.aPay", { amt: m[1], id: m[2] }),
  ],
  [/^\[공격 준비\] 공격자는 '결제 직전' 지점에서 몰래 다른 체인을 파기 시작합니다 😈$/, () => t("log.aPrep")],
  [/^\[안내\] 먼저 '① 결제 방송'을 눌러 주세요\.$/, () => t("log.aNeedPay")],
  [
    /^\[정직한 채굴\] 공개 체인에 블록 #(\d+) 추가 → 결제 컨펌 (\d+)개$/,
    (m) => t("log.aHonest", { id: m[1], n: m[2] }),
  ],
  [
    /^\[공격자 채굴 😈\] 비밀 블록 #(\d+): '공격자 → 공격자 (.+) BTC'로 결제를 무효화하는 역사 시작$/,
    (m) => t("log.aSecret1", { id: m[1], amt: m[2] }),
  ],
  [/^\[공격자 채굴 😈\] 비밀 블록 #(\d+) \(아직 아무도 모름\)$/, (m) => t("log.aSecret", { id: m[1] })],
  [/^\s*현재 길이 — 공개 (\d+) vs 공격자 (\d+)$/, (m) => t("log.aLen", { a: m[1], b: m[2] })],
  [/^\[안내\] 먼저 결제부터 시작하세요\.$/, () => t("log.aNeedPay2")],
  [/^\[무시\] 이미 공개했습니다\. 초기화 후 다시 해보세요\.$/, () => t("log.aIgnoreRevealed")],
  [
    /^\[💥 공개\] 공격자 체인\(길이 (\d+)\)이 공개 체인\(길이 (\d+)\)보다 김 → 네트워크가 재구성\(reorg\)!$/,
    (m) => t("log.aRevealWin", { a: m[1], b: m[2] }),
  ],
  [
    /^\[재구성\] 공개 체인의 '공격자 → 판매자' 결제가 사라지고, '공격자 → 공격자'로 대체됨 ⚠️$/,
    () => t("log.aReorg"),
  ],
  [
    /^\[결과\] 😈 공격 성공! 판매자는 이미 노트북을 발송했는데 돈은 공격자에게 돌아갔습니다\.$/,
    () => t("log.aWin"),
  ],
  [
    /^\[결과\] 결제는 되돌려졌지만, 판매자가 아직 노트북을 안 보내서 실질 피해는 없습니다\.$/,
    () => t("log.aWinNoShip"),
  ],
  [
    /^\[💥 공개\] 공격자 체인\(길이 (\d+)\)이 공개 체인\(길이 (\d+)\) 이하 → 네트워크가 무시!$/,
    (m) => t("log.aRevealLose", { a: m[1], b: m[2] }),
  ],
  [/^\[결과\] ✅ 공격 실패! 정직한 체인이 더 길어 결제가 그대로 확정됩니다\.$/, () => t("log.aLose")],
  [
    /^\[판매자 📦\] 결제 컨펌 (\d+)개 확인 → 노트북 발송 완료! \(현실에선 되돌릴 수 없음\)$/,
    (m) => t("log.aShip", { n: m[1] }),
  ],
];

// 엔진 원문(한국어) → 현재 언어. 한국어면 원문 그대로, 못 알아본 문장도 원문 그대로.
function trEngine(line) {
  if (getLang() === "ko") return line;
  for (const [re, fn] of ENGINE_LOG_PATTERNS) {
    const m = String(line).match(re);
    if (m) return fn(m);
  }
  return line;
}

// ---------- 엔진 로그 콘솔 공용 (원문 저장 → 번역 렌더 → 언어 전환 시 리렌더) ----------
const engineLogStore = { console: [], uConsole: [], netLog: [], dsLog: [] };

function engineLogDiv(line, clsFn) {
  const div = document.createElement("div");
  div.className = clsFn(line); // 분류는 항상 원문(한국어) 기준
  div.textContent = trEngine(line);
  return div;
}

function appendEngineLogs(boxId, lines, clsFn) {
  const box = $(boxId);
  if (!box) return;
  for (const line of lines) {
    engineLogStore[boxId].push(line);
    box.appendChild(engineLogDiv(line, clsFn));
  }
  box.scrollTop = box.scrollHeight;
}

function clearEngineLog(boxId) {
  engineLogStore[boxId] = [];
  const box = $(boxId);
  if (box) box.innerHTML = "";
}

function rerenderEngineLog(boxId, clsFn) {
  const box = $(boxId);
  if (!box) return;
  box.innerHTML = "";
  for (const line of engineLogStore[boxId]) box.appendChild(engineLogDiv(line, clsFn));
  box.scrollTop = box.scrollHeight;
}

// ---------- "붙어있는" 상태 메시지의 언어 전환 대응 ----------
// 송금 결과·위조 판정·채굴 상태처럼 화면에 남아 있는 마지막 메시지는
// 그리는 함수를 등록해 두고, 언어가 바뀌면 같은 함수를 다시 실행해 새 언어로 칠한다.
const stickies = new Map();
function sticky(id, fn) {
  stickies.set(id, fn);
  fn();
}
function clearSticky(...ids) {
  for (const id of ids) stickies.delete(id);
}
document.addEventListener("i18n:changed", () => {
  for (const fn of stickies.values()) fn();
});

// ---------- 복사 버튼 (호버 시 나타나 전체 값을 클립보드로) ----------
// 생략(…)된 주소·txid·공개키를 Ctrl+F 검색/비교하려 할 때 전체 값을 바로 복사.
function copyBtn(value, cls = "") {
  const label = t("js.copyTitle");
  return `<button type="button" class="copy-btn ${cls}" data-copy="${esc(
    String(value)
  )}" title="${esc(label)}" aria-label="${esc(label)}">⧉</button>`;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // clipboard API가 막힌 환경(비-https 등) 폴백
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".copy-btn");
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  const val = btn.getAttribute("data-copy") || "";
  const ok = await copyToClipboard(val);
  const prev = btn.textContent;
  btn.classList.add("copied");
  btn.textContent = ok ? "✓" : "✕";
  setTimeout(() => {
    btn.classList.remove("copied");
    btn.textContent = prev;
  }, 1000);
});

// ============================================================
// 탭 전환
// ============================================================
// 숫자 입력창은 직접 타이핑하면 max/min을 넘길 수 있다(HTML max는 스피너만 제한).
// 값을 확정하는 순간(change) min~max 범위로 자동 보정해 "입력은 되는데 적용 안 됨" 혼란을 없앤다.
document.addEventListener("change", (e) => {
  const el = e.target;
  if (!(el instanceof HTMLInputElement) || el.type !== "number") return;
  const v = Number(el.value);
  if (!Number.isFinite(v)) return; // 빈칸/잘못된 값은 사용자가 고치게 둔다
  const min = el.min !== "" ? Number(el.min) : -Infinity;
  const max = el.max !== "" ? Number(el.max) : Infinity;
  const clamped = Math.min(max, Math.max(min, v));
  if (String(clamped) !== el.value) el.value = String(clamped);
});

// ============================================================
// 커스텀 컨트롤 UI — 브라우저 기본 위젯을 앱 테마로 대체
// ============================================================

// ---------- 숫자 input 커스텀 스테퍼 (네이티브 화살표 대체) ----------
// step 값의 소수 자릿수를 구해 부동소수 오차(0.1+0.2=0.30000004)를 막는다.
function stepDecimals(step) {
  const s = String(step);
  const i = s.indexOf(".");
  return i < 0 ? 0 : s.length - i - 1;
}

function enhanceNumberInput(input) {
  if (input.dataset.enhanced) return;
  input.dataset.enhanced = "1";

  const wrap = document.createElement("span");
  wrap.className = "num-wrap";
  // 인라인 폭이 있으면 래퍼로 옮기고 입력은 래퍼를 꽉 채운다.
  // (CSS 클래스로 폭이 정해진 경우는 그대로 두어 레이아웃을 유지)
  if (input.style.width) {
    wrap.style.width = input.style.width;
    input.style.width = "100%";
  }
  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);

  const stepper = document.createElement("span");
  stepper.className = "num-stepper";
  stepper.innerHTML =
    `<button type="button" class="num-step up" tabindex="-1" aria-label="+"><span class="caret">▲</span></button>` +
    `<button type="button" class="num-step down" tabindex="-1" aria-label="−"><span class="caret">▼</span></button>`;
  wrap.appendChild(stepper);

  const upBtn = stepper.querySelector(".up");
  const downBtn = stepper.querySelector(".down");

  const bounds = () => ({
    min: input.min !== "" ? Number(input.min) : -Infinity,
    max: input.max !== "" ? Number(input.max) : Infinity,
    step: Number(input.step) || 1,
  });

  const refreshDisabled = () => {
    const { min, max } = bounds();
    const v = Number(input.value);
    const cur = Number.isFinite(v) ? v : 0;
    upBtn.disabled = cur >= max;
    downBtn.disabled = cur <= min;
  };

  const bump = (dir) => {
    if (input.disabled) return;
    const { min, max, step } = bounds();
    const cur = Number.isFinite(Number(input.value)) ? Number(input.value) : (min > -Infinity ? min : 0);
    let next = cur + dir * step;
    next = Math.min(max, Math.max(min, next));
    next = Number(next.toFixed(stepDecimals(step)));
    if (String(next) === input.value) return;
    input.value = String(next);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    refreshDisabled();
  };

  // 누르는 동안 반복 (짧게 지연 후 가속)
  const hold = (dir) => (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    bump(dir);
    let timer, interval;
    const clear = () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("mouseup", clear);
      window.removeEventListener("mouseleave", clear);
    };
    timer = setTimeout(() => {
      interval = setInterval(() => bump(dir), 60);
    }, 350);
    window.addEventListener("mouseup", clear);
    window.addEventListener("mouseleave", clear);
  };

  upBtn.addEventListener("mousedown", hold(1));
  downBtn.addEventListener("mousedown", hold(-1));
  input.addEventListener("input", refreshDisabled);
  input.addEventListener("change", refreshDisabled);
  refreshDisabled();
}

function enhanceNumberInputs(root = document) {
  root.querySelectorAll('input[type="number"]').forEach(enhanceNumberInput);
}

// ---------- 커스텀 셀렉트 (네이티브 <select> 대체, 프로그레시브 인핸스) ----------
// 원본 <select>는 폼 값·접근성·기존 JS(.value/change)를 위해 그대로 두고 숨긴다.
// 표시는 커스텀 드롭다운이 담당하고, 선택 시 원본 select에 반영 + change 발생.
function enhanceSelect(select) {
  if (select.dataset.enhanced) return;
  select.dataset.enhanced = "1";

  const wrap = document.createElement("div");
  wrap.className = "cs-select";
  if (select.style.width) wrap.style.width = select.style.width;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "cs-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.innerHTML = `<span class="cs-label"></span><span class="cs-caret">▾</span>`;

  const menu = document.createElement("ul");
  menu.className = "cs-menu";
  menu.setAttribute("role", "listbox");
  menu.hidden = true;

  select.classList.add("cs-native");
  select.setAttribute("tabindex", "-1");
  select.parentNode.insertBefore(wrap, select);
  wrap.appendChild(select);
  wrap.appendChild(trigger);
  wrap.appendChild(menu);

  const labelEl = trigger.querySelector(".cs-label");
  const options = () => Array.from(select.options);

  // 원본 <option>의 (번역된) 텍스트로 메뉴와 라벨을 다시 그린다.
  const sync = () => {
    labelEl.textContent = select.options[select.selectedIndex]?.textContent ?? "";
    menu.innerHTML = options()
      .map(
        (o) =>
          `<li role="option" data-value="${esc(o.value)}" aria-selected="${
            o.value === select.value ? "true" : "false"
          }">${esc(o.textContent)}</li>`
      )
      .join("");
  };
  sync();

  const close = () => {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  };
  const open = () => {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    const active = menu.querySelector('[aria-selected="true"]') || menu.firstElementChild;
    menu.querySelectorAll(".cs-active").forEach((el) => el.classList.remove("cs-active"));
    if (active) active.classList.add("cs-active");
  };
  const toggle = () => (menu.hidden ? open() : close());

  const choose = (value) => {
    if (select.value !== value) {
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    sync();
    close();
    trigger.focus();
  };

  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  });

  menu.addEventListener("click", (e) => {
    const li = e.target.closest("[data-value]");
    if (!li) return;
    choose(li.dataset.value);
  });

  // 키보드 접근성
  function moveActive(dir) {
    const items = Array.from(menu.children);
    let idx = items.findIndex((el) => el.classList.contains("cs-active"));
    idx = Math.max(0, Math.min(items.length - 1, idx + dir));
    items.forEach((el) => el.classList.remove("cs-active"));
    items[idx]?.classList.add("cs-active");
  }
  trigger.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        menu.hidden ? open() : moveActive(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        menu.hidden ? open() : moveActive(-1);
        break;
      case "Enter":
      case " ": {
        e.preventDefault();
        if (menu.hidden) { open(); break; }
        const active = menu.querySelector(".cs-active");
        if (active) choose(active.dataset.value);
        break;
      }
      case "Escape":
        close();
        break;
    }
  });

  document.addEventListener("click", (e) => {
    if (!menu.hidden && !wrap.contains(e.target)) close();
  });

  // 언어 전환 시 원본 option 텍스트가 번역되므로 라벨·메뉴를 다시 동기화한다.
  document.addEventListener("i18n:changed", sync);
  // 외부에서 select.value를 바꿨을 때도 반영되도록 change를 듣는다.
  select.addEventListener("change", sync);
}

function enhanceSelects(root = document) {
  root.querySelectorAll("select").forEach(enhanceSelect);
}

// ---------- Bitcoin / Ethereum 체인 스위처 ----------
const CHAIN_KEY = "vbe-chain";
let currentChain = "btc";

function pickInitialChain() {
  const q = new URLSearchParams(location.search).get("chain");
  if (q === "eth" || q === "btc") return q;
  const saved = localStorage.getItem(CHAIN_KEY);
  if (saved === "eth" || saved === "btc") return saved;
  return "btc";
}

function applyChain(chain, { persist = true, updateUrl = true } = {}) {
  currentChain = chain === "eth" ? "eth" : "btc";
  if (persist) localStorage.setItem(CHAIN_KEY, currentChain);
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set("chain", currentChain);
    history.replaceState(null, "", url);
  }

  document.body.dataset.chain = currentChain;
  $("tabsBtc").hidden = currentChain !== "btc";
  $("tabsEth").hidden = currentChain !== "eth";
  document.querySelectorAll(".chain-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.chain === currentChain)
  );

  // 로고·타이틀·태그라인
  // ETH: Ξ(세 줄)가 아니라 공식 마크에 가까운 다이아몬드(八角) SVG
  const ETH_DIAMOND_SVG = `<svg class="eth-diamond" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path fill="#fff" fill-opacity=".7" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
    <path fill="#fff" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
    <path fill="#fff" fill-opacity=".7" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/>
    <path fill="#fff" d="M127.962 416.905v-104.72L0 236.585z"/>
    <path fill="#fff" fill-opacity=".4" d="M127.961 287.958l127.96-75.637-127.96-58.162z"/>
    <path fill="#fff" fill-opacity=".6" d="M0 212.321l127.96 75.637v-133.8z"/>
  </svg>`;
  const logo = $("chainLogo");
  const title = $("chainTitle");
  const tag = $("chainTagline");
  const footer = $("footerText");
  if (currentChain === "eth") {
    if (logo) {
      logo.innerHTML = ETH_DIAMOND_SVG;
      logo.classList.add("eth");
    }
    if (title) title.textContent = t("eth.header.title");
    if (tag) {
      tag.removeAttribute("data-i18n");
      tag.innerHTML = t("eth.header.tagline");
    }
    document.title = t("eth.meta.title");
    if (footer) {
      footer.removeAttribute("data-i18n");
      footer.textContent = t("eth.footer.text");
    }
  } else {
    if (logo) {
      logo.textContent = "₿";
      logo.classList.remove("eth");
    }
    if (title) title.textContent = "Visual Bitcoin Engine";
    if (tag) {
      tag.setAttribute("data-i18n", "header.tagline");
      tag.innerHTML = t("header.tagline");
    }
    document.title = t("meta.title");
    if (footer) {
      footer.setAttribute("data-i18n", "footer.text");
      footer.textContent = t("footer.text");
    }
  }

  // 패널: 현재 체인의 활성 탭만 표시
  document.querySelectorAll(".tab-panel").forEach((p) => {
    const isChain = p.dataset.chain === currentChain;
    if (!isChain) {
      p.classList.remove("active");
      return;
    }
  });
  const nav = currentChain === "eth" ? $("tabsEth") : $("tabsBtc");
  let activeBtn = nav.querySelector(".tab-btn.active");
  if (!activeBtn) activeBtn = nav.querySelector(".tab-btn");
  if (activeBtn) {
    nav.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b === activeBtn));
    const tab = activeBtn.dataset.tab;
    document.querySelectorAll(`.tab-panel[data-chain="${currentChain}"]`).forEach((p) =>
      p.classList.toggle("active", p.id === `tab-${tab}`)
    );
  }

  if (currentChain === "eth") refreshEth();
}

function setupChainSwitch() {
  currentChain = pickInitialChain();
  $("chainSwitch")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".chain-btn");
    if (!btn) return;
    applyChain(btn.dataset.chain);
  });
  applyChain(currentChain, { persist: true, updateUrl: true });
}

function bindTabNav(navId) {
  $(navId)?.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn");
    if (!btn) return;
    const tab = btn.dataset.tab;
    const nav = $(navId);
    nav.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
    const chain = navId === "tabsEth" ? "eth" : "btc";
    document.querySelectorAll(`.tab-panel[data-chain="${chain}"]`).forEach((p) =>
      p.classList.toggle("active", p.id === `tab-${tab}`)
    );
  });
}

// 다국어 초기화 (엔진 로딩과 무관하게 즉시 적용). 언어 변경 시 엔진 상태 문구도 갱신.
initI18n();
bindTabNav("tabsBtc");
bindTabNav("tabsEth");
setupChainSwitch();
document.addEventListener("i18n:changed", () => {
  applyChain(currentChain, { persist: false, updateUrl: false });
  const badge = $("engineBadge");
  const st = $("engineStatus");
  if (!badge || !st) return;
  if (badge.classList.contains("ready")) st.textContent = t("header.engineReady");
  else if (badge.classList.contains("error")) st.textContent = t("header.engineError");
  else st.textContent = t("header.engineLoading");
});

// WASM과 무관하게 바로 켜두는 UI(툴팁 · 곡선 시각화). 엔진 로딩 실패해도 떠야 한다.
setupTooltips();
setupCurveViz();

// 브라우저 기본 위젯을 앱 테마로 대체 (정적 HTML 요소는 지금 바로 적용)
enhanceNumberInputs();
enhanceSelects();

// ============================================================
// 메인: WASM 초기화 후 모든 기능 연결
// ============================================================
init()
  .then(() => {
    $("engineBadge").classList.add("ready");
    $("engineStatus").textContent = t("header.engineReady");
    setupSha();
    setupMiningLab();
    setupChainSim();
    setupUtxo();
    setupAnatomy();
    setupNetwork();
    setupDoubleSpend();
    setupEth(WasmEth, eth_keccak256, eth_address_from_label, evm_run);

    // 언어 전환 시 t()로 그려진 동적 UI를 현재 상태 그대로 다시 렌더
    document.addEventListener("i18n:changed", () => {
      if (engine) {
        render();
        rerenderEngineLog("console", csLogClass);
        // 검증 결과 배너가 떠 있으면 새 언어로 다시 계산해 표시
        if ($("verdict").style.display !== "none" && $("verdict").style.display !== "")
          runValidate();
      }
      if (utxo) {
        renderUtxoPool();
        rerenderEngineLog("uConsole", uLogClass);
      }
      buildMerkle();
      if (anMiner) renderHeader(JSON.parse(anMiner.info()));
      if (netEngine) {
        renderNet();
        rerenderEngineLog("netLog", netLogClass);
      }
      if (dsEngine) {
        renderDs();
        renderDsCalc();
        rerenderEngineLog("dsLog", dsLogClass);
      }
    });
  })
  .catch((err) => {
    $("engineBadge").classList.add("error");
    $("engineStatus").textContent = t("header.engineError");
    console.error(err);
  });

// ============================================================
// 커스텀 툴팁 (? 도움말) — 호버 + 포커스 + 모바일 탭 지원
// ============================================================
// 기존엔 브라우저 기본 title 속성이라 모바일(터치)에선 안 뜨고 화면 끝에서 잘렸다.
// 이걸 화면 안으로 위치를 보정하는 말풍선으로 바꾼다.
function setupTooltips() {
  const bubble = document.createElement("div");
  bubble.className = "tooltip-bubble";
  document.body.appendChild(bubble);
  let current = null;

  // .hint 의 title → data-tip 으로 옮겨 네이티브 툴팁을 끄고, 키보드 접근 가능하게.
  document.querySelectorAll(".hint[title]").forEach((h) => {
    h.dataset.tip = h.getAttribute("title");
    h.removeAttribute("title");
    h.setAttribute("tabindex", "0");
    h.setAttribute("role", "button");
    h.setAttribute("aria-label", t("js.helpAria"));
  });

  function show(h) {
    const tip = h.dataset.tip;
    if (!tip) return;
    current = h;
    bubble.textContent = tip;
    bubble.classList.add("show");

    // 말풍선 크기를 잰 뒤 화면 안으로 위치 보정
    const r = h.getBoundingClientRect();
    const margin = 8;
    const bw = bubble.offsetWidth;
    const bh = bubble.offsetHeight;
    let left = r.left + r.width / 2 - bw / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - bw - margin));
    let top = r.bottom + 6; // 기본은 아래쪽
    if (top + bh > window.innerHeight - margin) top = r.top - bh - 6; // 아래 공간 없으면 위로
    bubble.style.left = `${left}px`;
    bubble.style.top = `${Math.max(margin, top)}px`;
  }
  function hide() {
    current = null;
    bubble.classList.remove("show");
  }

  document.addEventListener("mouseover", (e) => {
    const h = e.target.closest(".hint");
    if (h) show(h);
  });
  document.addEventListener("mouseout", (e) => {
    const h = e.target.closest(".hint");
    if (h && h === current) hide();
  });
  document.addEventListener("focusin", (e) => {
    const h = e.target.closest && e.target.closest(".hint");
    if (h) show(h);
  });
  document.addEventListener("focusout", (e) => {
    const h = e.target.closest && e.target.closest(".hint");
    if (h && h === current) hide();
  });
  // 모바일/클릭: 탭하면 토글, 바깥을 누르면 닫힘
  document.addEventListener("click", (e) => {
    const h = e.target.closest(".hint");
    if (h) {
      e.preventDefault(); // label 안의 힌트를 눌러도 입력창이 포커스되지 않게
      e.stopPropagation();
      current === h ? hide() : show(h);
    } else if (current) {
      hide();
    }
  });
  window.addEventListener("scroll", hide, true);
  window.addEventListener("resize", hide);
}

// ============================================================
// 타원곡선 시각화 (탭 4) — "개인키 = 점프 횟수, 공개키 = 착지점"
// ============================================================
// 실수 위의 곡선 y² = x³ + 7 로 점 덧셈(선 긋기 → 만나는 점 → 뒤집기)을 그린다.
// 진짜 secp256k1(유한체)은 점들이 흩어져 못 그리지만, 직관은 똑같다.
function setupCurveViz() {
  const svg = document.getElementById("curveSvg");
  if (!svg) return;

  const W = 520, H = 360;
  const xmin = -3, xmax = 5, ymin = -8.5, ymax = 8.5;
  const sx = (x) => ((x - xmin) / (xmax - xmin)) * W;
  const sy = (y) => H - ((y - ymin) / (ymax - ymin)) * H;
  const B = 7;

  // 실수 타원곡선 점 덧셈 (a=0)
  const addPts = (P, Q) => {
    let lam;
    if (Math.abs(P.x - Q.x) < 1e-9 && Math.abs(P.y - Q.y) < 1e-9) {
      lam = (3 * P.x * P.x) / (2 * P.y); // 접선(같은 점 더하기)
    } else {
      lam = (Q.y - P.y) / (Q.x - P.x); // 두 점 잇는 선
    }
    const x = lam * lam - P.x - Q.x;
    const y = lam * (P.x - x) - P.y;
    return { x, y, lam };
  };

  const G = { x: -1, y: Math.sqrt(-1 * -1 * -1 + B) }; // (-1, √6)
  const MAXD = 4;
  const all = [G];
  for (let i = 1; i < MAXD; i++) all.push(addPts(all[i - 1], G));

  // 곡선 경로(위/아래 가지)
  const x0 = -Math.cbrt(B);
  const up = [], lo = [];
  for (let x = x0; x <= xmax; x += 0.03) {
    const v = x * x * x + B;
    if (v < 0) continue;
    const yy = Math.sqrt(v);
    up.push([sx(x), sy(yy)]);
    lo.push([sx(x), sy(-yy)]);
  }
  const toPath = (arr) => arr.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join("");
  const curvePath = toPath(up) + toPath(lo);

  const label = (i) => (i === 0 ? "G" : i + 1 + "G");
  let d = 1;

  function render() {
    const shown = all.slice(0, d);
    const Q = shown[shown.length - 1];
    let g = "";

    // 축
    g += `<line x1="0" y1="${sy(0)}" x2="${W}" y2="${sy(0)}" stroke="#2a2f3a"/>`;
    g += `<line x1="${sx(0)}" y1="0" x2="${sx(0)}" y2="${H}" stroke="#2a2f3a"/>`;
    // 곡선
    g += `<path d="${curvePath}" fill="none" stroke="#5b6270" stroke-width="2"/>`;
    g += `<text x="${W - 6}" y="${sy(0) - 6}" fill="#5b6270" font-size="11" text-anchor="end">y² = x³ + 7</text>`;

    // 마지막 덧셈의 작도선 (d>=2)
    if (d >= 2) {
      const src = d === 2 ? G : all[d - 2];
      const N = all[d - 1];
      const yAt = (x) => src.y + N.lam * (x - src.x);
      g += `<line x1="${sx(xmin)}" y1="${sy(yAt(xmin))}" x2="${sx(xmax)}" y2="${sy(yAt(xmax))}" stroke="#58a6ff" stroke-width="1.5" stroke-dasharray="5 4"/>`;
      // 선이 곡선과 만나는 세 번째 점 (N.x, -N.y) → 위아래로 뒤집으면 새 점 N
      g += `<circle cx="${sx(N.x)}" cy="${sy(-N.y)}" r="4" fill="none" stroke="#58a6ff" stroke-width="1.5"/>`;
      g += `<line x1="${sx(N.x)}" y1="${sy(-N.y)}" x2="${sx(N.x)}" y2="${sy(N.y)}" stroke="#bc8cff" stroke-width="1.5" stroke-dasharray="4 4" marker-end="url(#cvArrow)"/>`;
    }

    // 점들
    shown.forEach((p, i) => {
      const isG = i === 0;
      const isQ = i === shown.length - 1;
      const color = isG ? "#3fb950" : isQ ? "#f7931a" : "#c9d1d9";
      g += `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="${isQ ? 6 : 4.5}" fill="${color}"/>`;
      const txt = label(i) + (isQ && d > 1 ? " = Q" : "");
      g += `<text x="${sx(p.x) + 8}" y="${sy(p.y) - 8}" fill="${color}" font-size="13" font-weight="700">${txt}</text>`;
    });

    svg.innerHTML =
      `<defs><marker id="cvArrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">` +
      `<path d="M0,0 L6,3 L0,6 Z" fill="#bc8cff"/></marker></defs>` + g;

    const rd = document.getElementById("curveRead");
    if (rd)
      rd.innerHTML = t("js.curveRead", { d, x: Q.x.toFixed(2), y: Q.y.toFixed(2) });
    const ab = document.getElementById("curveAdd");
    if (ab) ab.disabled = d >= MAXD;
  }

  document.getElementById("curveAdd").addEventListener("click", () => {
    if (d < MAXD) {
      d++;
      render();
    }
  });
  document.getElementById("curveReset").addEventListener("click", () => {
    d = 1;
    render();
  });
  render();
  document.addEventListener("i18n:changed", render);
}

// ============================================================
// 탭 1 — SHA-256 놀이터
// ============================================================
function setupSha() {
  const input = $("shaInput");
  const out = $("shaOutput");
  const len = $("shaLen");

  const render = () => {
    const h = sha256(input.value);
    out.textContent = h;
    len.textContent = h.length;
  };
  input.addEventListener("input", render);
  render();

  // --- 눈사태 효과 ---
  const avA = $("avA");
  const avB = $("avB");
  const renderAv = () => {
    const ha = sha256(avA.value);
    const hb = sha256(avB.value);
    $("avHashA").textContent = ha;

    // B를 A와 비교해 다른 자리만 빨갛게
    let html = "";
    let diff = 0;
    for (let i = 0; i < hb.length; i++) {
      if (hb[i] !== ha[i]) {
        html += `<span class="diff">${hb[i]}</span>`;
        diff++;
      } else {
        html += hb[i];
      }
    }
    $("avHashB").innerHTML = html;
    $("avDiffCount").textContent = diff;

    // 입력이 몇 글자 다른지 (대략)
    const a = avA.value, b = avB.value;
    let charDiff = Math.abs(a.length - b.length);
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) charDiff++;
    $("avDelta").textContent = a === b ? t("sha.sameInput") : t("sha.nChars", { n: charDiff });
  };
  avA.addEventListener("input", renderAv);
  avB.addEventListener("input", renderAv);
  renderAv();

  // 언어 전환 시 data-i18n 치환으로 초기화된 결과 값(#shaLen 등)을 다시 채운다
  document.addEventListener("i18n:changed", () => {
    render();
    renderAv();
  });

  // --- 미니 블록체인: 해시가 블록을 잇는다 ---
  setupMiniChain();
}

// 탭 1 하단: SHA-256 해시로 블록을 "연결"하는 원리를 직접 만져보는 미니 체인.
// 각 블록 해시 = SHA-256(앞 블록 해시 + 데이터 + nonce).
// - 데이터/nonce를 고치면 그 블록 해시가 바뀌고, 뒤 블록들이 줄줄이 다시 계산된다(연결).
// - ⛏ 채굴 버튼은 해시 앞이 "0"으로 시작할 때까지 nonce를 자동으로 찾는다(탭 2의 작업증명 축소판).
function setupMiniChain() {
  const box = $("mcChain");
  if (!box) return;

  const GENESIS_PREV = "0".repeat(64);
  const blocks = [
    { data: "Satoshi → Alice : 10 BTC" },
    { data: "Alice → Bob : 4 BTC" },
    { data: "Bob → Carol : 1 BTC" },
  ];

  box.innerHTML = blocks
    .map((b, i) => {
      const link =
        i > 0
          ? `<div class="mc-link" data-i18n-attr="title:mc.linkTip" title="이 블록의 '이전 해시' = 바로 앞 블록의 '이 블록 해시'"></div>`
          : "";
      return `${link}
      <div class="mc-block ${i === 0 ? "genesis" : ""}">
        <div class="mc-head">
          <span class="id"><span data-i18n="mc.block">블록</span> #${i + 1}</span>
          ${i === 0 ? '<span class="tag" data-i18n="mc.genesis">제네시스(첫 블록)</span>' : ""}
        </div>
        <div class="mc-row">
          <span class="k" data-i18n="mc.data">데이터</span>
          <input id="mcData${i}" value="${esc(b.data)}" />
        </div>
        <div class="mc-row">
          <span class="k">nonce</span>
          <div class="mc-nonce">
            <input id="mcNonce${i}" type="number" value="0" />
            <button class="btn sm" data-mine="${i}" data-i18n="mc.mine">⛏ 채굴 (해시 앞을 0으로)</button>
          </div>
        </div>
        <div class="mc-row">
          <span class="k" data-i18n="mc.prevHash">이전 해시</span>
          <span class="mc-hash prev" id="mcPrev${i}"></span>
        </div>
        <div class="mc-row">
          <span class="k" data-i18n="mc.thisHash">이 블록 해시</span>
          <span class="mc-hash self" id="mcHash${i}"></span>
        </div>
      </div>`;
    })
    .join("");
  applyI18n(box); // 동적 생성 직후 현재 언어 적용
  enhanceNumberInputs(box); // 동적 생성된 nonce 입력에 커스텀 스테퍼 적용

  const hashOf = (prev, i) =>
    sha256(prev + $(`mcData${i}`).value + $(`mcNonce${i}`).value);

  // flashFrom 이후의 블록들은 해시가 바뀐 걸 강조(주황 반짝)
  const recompute = (flashFrom = -1) => {
    let prev = GENESIS_PREV;
    for (let i = 0; i < blocks.length; i++) {
      const hash = hashOf(prev, i);
      $(`mcPrev${i}`).textContent = prev;
      const hashEl = $(`mcHash${i}`);
      hashEl.innerHTML = hlLeadingZeros(hash); // 앞의 0을 주황으로 강조
      if (flashFrom >= 0 && i >= flashFrom) {
        hashEl.classList.remove("flash");
        void hashEl.offsetWidth; // 애니메이션 재시작을 위한 강제 리플로우
        hashEl.classList.add("flash");
      }
      prev = hash; // 이 블록의 해시가 다음 블록의 '이전 해시'가 된다
    }
  };

  // 블록 i까지의 '이전 해시'(= i-1블록의 해시)를 구한다.
  const prevOf = (i) => {
    let prev = GENESIS_PREV;
    for (let j = 0; j < i; j++) prev = hashOf(prev, j);
    return prev;
  };

  // ⛏ 채굴: 해시가 "0"으로 시작할 때까지 nonce를 0,1,2,… 늘려 찾는다(난이도 1).
  // 곧바로 정답으로 점프하지 않고, nonce가 또르르 올라가다 멈추는 "노가다"를 눈으로 보여준다.
  const mining = new Set();
  const mine = (i) => {
    if (mining.has(i)) return;
    mining.add(i);
    const prev = prevOf(i);
    const data = $(`mcData${i}`).value;
    const nonceEl = $(`mcNonce${i}`);
    const hashEl = $(`mcHash${i}`);
    const btn = box.querySelector(`[data-mine="${i}"]`);
    btn.disabled = true;
    btn.textContent = t("mc.mining");

    let n = 0;
    const step = () => {
      const h = sha256(prev + data + String(n));
      nonceEl.value = n;
      hashEl.innerHTML = hlLeadingZeros(h); // 실패 중엔 앞에 0이 없어 강조도 안 됨
      if (h.startsWith("0")) {
        mining.delete(i);
        btn.disabled = false;
        btn.textContent = t("mc.mine");
        recompute(i); // 정답을 찾았으니 뒤 블록까지 갱신 + 강조
        return;
      }
      n++;
      setTimeout(step, 90);
    };
    step();
  };

  blocks.forEach((_, i) => {
    $(`mcData${i}`).addEventListener("input", () => recompute(i));
    $(`mcNonce${i}`).addEventListener("input", () => recompute(i));
  });
  box.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-mine]");
    if (btn) mine(Number(btn.dataset.mine));
  });
  recompute();
}

// ============================================================
// 탭 2 — 채굴 실험실 (Proof of Work)
// ============================================================
function setupMiningLab() {
  const dataEl = $("powData");
  const diffEl = $("powDiff");
  const diffVal = $("powDiffVal");
  const target = $("powTarget");
  const startBtn = $("powStart");
  const stopBtn = $("powStop");
  const logEl = $("powLog");

  let running = false;
  let nonce = 0;
  let attempts = 0;
  let startTime = 0;
  let rafId = null;
  let slowTimer = null;

  // 로그를 "원시 데이터"로도 기억해 언어 전환 시 새 언어로 전부 다시 그린다.
  const logRaw = [];

  function attemptDiv(e) {
    const short = e.hash.slice(0, 24);
    const m = short.match(/^0+/);
    const z = m ? m[0].length : 0;
    const hl = `<span class="lead0">${short.slice(0, z)}</span>${esc(short.slice(z))}`;
    const div = document.createElement("div");
    div.className = "line " + (e.ok ? "win" : "fail");
    div.innerHTML = e.ok
      ? `✅ nonce=${fmtInt(e.n)} → <span class="h">${hl}…</span>  ${t("js.powWin")}`
      : `❌ nonce=${fmtInt(e.n)} → <span class="h">${hl}…</span>`;
    return div;
  }
  function noteDiv(e) {
    const div = document.createElement("div");
    div.className = "line " + (e.cls || "skip");
    div.textContent = t(e.key, e.params);
    return div;
  }
  const logDiv = (e) => (e.type === "attempt" ? attemptDiv(e) : noteDiv(e));

  function pushLog(entry) {
    logRaw.push(entry);
    logEl.appendChild(logDiv(entry));
    // 너무 길어지지 않게 최근 200줄만 유지
    while (logRaw.length > 200) logRaw.shift();
    while (logEl.childElementCount > 200) logEl.removeChild(logEl.firstChild);
    logEl.scrollTop = logEl.scrollHeight;
  }

  // 시도 한 줄을 노가다 로그에 추가
  function logAttempt(n, hash, ok) {
    pushLog({ type: "attempt", n, hash, ok });
  }
  function logNote(key, params, cls) {
    pushLog({ type: "note", key, params, cls });
  }

  // 언어 전환 시 로그 전체 + 채굴 기록 + 목표 표기를 새 언어로 다시 렌더
  // (목표 문구는 data-i18n 치환으로 #powTarget이 기본값 000으로 초기화되므로 다시 채운다)
  document.addEventListener("i18n:changed", () => {
    logEl.innerHTML = "";
    for (const e of logRaw) logEl.appendChild(logDiv(e));
    logEl.scrollTop = logEl.scrollHeight;
    renderPowHistory();
    updateTarget();
    $("powPreimage").textContent = lastPreimage;
  });

  const updateTarget = () => {
    const d = Number(diffEl.value);
    diffVal.textContent = d;
    target.textContent = "0".repeat(d);
  };
  diffEl.addEventListener("input", () => {
    updateTarget();
    if (!running) resetStage();
  });
  updateTarget();

  function resetStage() {
    $("powHash").classList.remove("found");
    $("powHash").innerHTML = "—";
    lastPreimage = "—";
    $("powPreimage").textContent = lastPreimage;
    $("powNonce").textContent = "0";
    $("powAttempts").textContent = "0";
    $("powRate").textContent = "0";
    $("powElapsed").textContent = "0.0s";
    logRaw.length = 0;
    logEl.innerHTML = "";
    logNote("js.powIdle", undefined, "init");
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (slowTimer) clearTimeout(slowTimer);
    rafId = null;
    slowTimer = null;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    dataEl.disabled = false;
    diffEl.disabled = false;
    $("powAnim").hidden = true; // 곡괭이질 애니메이션 숨김
  }

  // 화면 상단 통계 + 현재 해시 갱신
  let lastPreimage = "—"; // 언어 전환 시 data-i18n 치환으로 지워진 값을 복원하기 위해 기억
  function updateStage(data, shownNonce, hash, found) {
    const elapsed = (performance.now() - startTime) / 1000;
    $("powNonce").textContent = fmtInt(shownNonce);
    $("powAttempts").textContent = fmtInt(attempts);
    $("powRate").textContent = fmtInt(Math.round(attempts / Math.max(elapsed, 0.001)));
    $("powElapsed").textContent = elapsed.toFixed(1) + "s";
    $("powHash").innerHTML = hlLeadingZeros(hash);
    lastPreimage = pow_preimage(data, BigInt(shownNonce));
    $("powPreimage").textContent = lastPreimage;
    return elapsed;
  }

  function finish(data, difficulty, winNonce, hash) {
    attempts = winNonce + 1;
    const elapsed = updateStage(data, winNonce, hash, true);
    $("powHash").classList.add("found");
    logAttempt(winNonce, hash, true);
    logNote("js.powDone", { n: fmtInt(attempts), d: difficulty, s: elapsed.toFixed(2) });
    addPowHistory(difficulty, attempts, elapsed);
    stop();
  }

  const SLOW_COUNT = 14; // 처음 몇 번은 한 개씩 천천히 보여준다

  startBtn.addEventListener("click", () => {
    if (running) return;
    running = true;
    nonce = 0;
    attempts = 0;
    startTime = performance.now();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    dataEl.disabled = true;
    diffEl.disabled = true;
    $("powHash").classList.remove("found");
    $("powAnim").hidden = false; // 곡괭이질 애니메이션 표시
    logRaw.length = 0;
    logEl.innerHTML = "";

    const data = dataEl.value;
    const difficulty = Number(diffEl.value);
    logNote("js.powGoal", { data, zeros: "0".repeat(difficulty) });

    // --- 1단계: 한 개씩 천천히 (진짜 노가다 체감) ---
    const slowStep = (i) => {
      if (!running) return;
      const tried = nonce;
      const res = JSON.parse(pow_try(data, difficulty, BigInt(tried), 1n));
      attempts = res.attempts;
      updateStage(data, tried, res.hash, res.found);
      logAttempt(tried, res.hash, res.found);

      if (res.found) return finish(data, difficulty, tried, res.hash);
      nonce = tried + 1;

      if (i + 1 < SLOW_COUNT) {
        slowTimer = setTimeout(() => slowStep(i + 1), 75);
      } else {
        logNote("js.powFast");
        rafId = requestAnimationFrame(fastTick);
      }
    };

    // --- 2단계: 빠르게 (한 프레임에 BATCH개씩) ---
    const BATCH = 12000;
    let lastLogged = -1;
    const fastTick = () => {
      if (!running) return;
      const res = JSON.parse(pow_try(data, difficulty, BigInt(nonce), BigInt(BATCH)));
      attempts = res.attempts;
      const shown = res.found ? res.nonce : res.nonce - 1;
      updateStage(data, shown, res.hash, res.found);

      if (res.found) return finish(data, difficulty, res.nonce, res.hash);

      // 표본 한 줄 (매 배치의 마지막 시도)
      if (shown !== lastLogged) {
        logAttempt(shown, res.hash, false);
        lastLogged = shown;
      }
      nonce = res.nonce;
      rafId = requestAnimationFrame(fastTick);
    };

    slowStep(0);
  });

  stopBtn.addEventListener("click", stop);

  const history = [];
  function renderPowHistory() {
    if (!history.length) return;
    $("powHistory").innerHTML =
      `<hr class='sep'>${t("js.powHistH")}<br>` +
      history
        .slice(0, 8)
        .map((h) => t("js.powHistRow", { d: h.d, n: fmtInt(h.att), s: h.sec.toFixed(2) }))
        .join("<br>");
  }
  function addPowHistory(d, att, sec) {
    history.unshift({ d, att, sec });
    renderPowHistory();
  }
}

// ============================================================
// 탭 3 — 블록체인 시뮬레이터
// ============================================================
let engine = null; // 현재 WasmEngine 인스턴스

const PRESETS = {
  educational: { diff: 2, adjust: 4, target: 3, reward: 50, halving: 10, maxtx: 10 },
  bitcoin: { diff: 1, adjust: 2016, target: 600, reward: 50, halving: 210000, maxtx: 3000 },
};

function setupChainSim() {
  // 프리셋 선택 → 입력칸 채우기
  $("preset").addEventListener("change", (e) => {
    const p = PRESETS[e.target.value];
    if (!p) return; // custom
    $("cfgDiff").value = p.diff;
    $("cfgAdjust").value = p.adjust;
    $("cfgTarget").value = p.target;
    $("cfgReward").value = p.reward;
    $("cfgHalving").value = p.halving;
    $("cfgMaxTx").value = p.maxtx;
  });

  $("engineStart").addEventListener("click", startEngine);

  $("txAdd").addEventListener("click", () => {
    const from = $("txFrom").value.trim();
    const to = $("txTo").value.trim();
    const amount = Number($("txAmount").value);
    if (!from || !to || !(amount > 0)) {
      flashTxMsg("js.txInvalid", undefined, false);
      return;
    }
    const ok = engine.add_transaction(from, to, amount);
    flashTxMsg(
      ok ? "js.txOk" : "js.txRejected",
      ok ? { from, to, amt: fmtBtc(amount) } : { from },
      ok
    );
    pullLogs();
    render();
  });

  $("mineBtn").addEventListener("click", mineBlock);
  $("validateBtn").addEventListener("click", runValidate);

  // 첫 채굴 배너 버튼: 채굴 섹션으로 스크롤하며 바로 채굴 시작
  $("firstMineBtn").addEventListener("click", () => {
    $("mineBtn").scrollIntoView({ behavior: "smooth", block: "center" });
    mineBlock();
  });

  // 위변조 버튼은 동적으로 생성되므로 이벤트 위임
  $("chain").addEventListener("click", (e) => {
    const rehashBtn = e.target.closest("[data-tamper-rehash]");
    if (rehashBtn) {
      const [bi, ti] = rehashBtn.dataset.tamperRehash.split(":").map(Number);
      doTamper(bi, ti, true);
      return;
    }
    const btn = e.target.closest("[data-tamper]");
    if (!btn) return;
    const [bi, ti] = btn.dataset.tamper.split(":").map(Number);
    doTamper(bi, ti, false);
  });

  startEngine();
}

function readConfig() {
  return {
    diff: Number($("cfgDiff").value),
    adjust: Number($("cfgAdjust").value),
    target: Number($("cfgTarget").value),
    reward: Number($("cfgReward").value),
    halving: Number($("cfgHalving").value),
    maxtx: Number($("cfgMaxTx").value),
  };
}

function startEngine() {
  const c = readConfig();
  if (engine) engine.free?.();
  const u64 = (x) => BigInt(Math.max(1, Math.floor(x || 0)));
  // u64 파라미터(adjust/target/halving)는 BigInt로 넘겨야 한다.
  engine = new WasmEngine(
    Math.max(1, Math.floor(c.diff)),
    u64(c.adjust),
    u64(c.target),
    c.reward,
    u64(c.halving),
    Math.max(1, Math.floor(c.maxtx))
  );
  clearEngineLog("console");
  clearSticky("txMsg");
  $("txMsg").textContent = "";
  $("verdict").style.display = "none";
  pullLogs();
  render();
}

// ---------- 스냅샷을 받아 화면 전체를 다시 그린다 ----------
function snap() {
  return JSON.parse(engine.snapshot());
}

function render() {
  const s = snap();

  // 통계
  $("stHeight").textContent = s.height;
  $("stDiff").textContent = s.difficulty;
  $("stReward").innerHTML = `${fmtBtc(s.current_reward)}<small> BTC</small>`;
  $("stMempool").textContent = s.pending.length;
  const supply = s.balances.reduce((a, b) => a + b.amount, 0);
  $("stSupply").innerHTML = `${fmtBtc(supply)}<small> BTC</small>`;

  // 첫 채굴 유도 배너: 아직 아무도 코인이 없을 때만 (거래를 하려면 먼저 채굴 필요)
  const noCoins = s.balances.length === 0;
  $("firstMineBanner").style.display = noCoins ? "block" : "none";
  if (noCoins) {
    $("fmReward").textContent = fmtBtc(s.current_reward);
    $("fmMiner").textContent = $("minerAddr").value.trim() || "Satoshi";
  }

  renderBalances(s.balances);
  renderMempool(s.pending);
  renderChain(s.chain);
  updateAddrList(s);
}

function renderBalances(balances) {
  const box = $("balances");
  if (!balances.length) {
    box.innerHTML = `<div class="empty">${t("js.noBalances")}</div>`;
    return;
  }
  const max = Math.max(...balances.map((b) => b.amount), 1);
  box.innerHTML = balances
    .map((b) => {
      const isMiner = /miner|satoshi/i.test(b.address);
      return `<div class="bal-row">
        <span class="name ${isMiner ? "miner" : ""}">${esc(b.address)}</span>
        <span class="bal-bar"><span style="width:${(b.amount / max) * 100}%"></span></span>
        <span class="amt">${fmtBtc(b.amount)} BTC</span>
      </div>`;
    })
    .join("");
}

function renderMempool(pending) {
  const box = $("mempool");
  if (!pending.length) {
    box.innerHTML = `<div class="empty">${t("js.noMempool")}</div>`;
    return;
  }
  box.innerHTML = pending.map((tx) => txRow(tx)).join("");
}

function txRow(tx, opts = {}) {
  const coinbase = tx.from === "COINBASE";
  const cls = `tx ${coinbase ? "coinbase" : ""} ${opts.tampered ? "tampered" : ""}`;
  const tamperBtns =
    opts.tamperKey != null
      ? `<button class="btn danger sm" data-tamper="${opts.tamperKey}" title="${esc(t("js.tamperTip"))}">${t("js.tamperBtn")}</button>
    <button class="btn danger sm" data-tamper-rehash="${opts.tamperKey}" title="${esc(t("js.tamperRehashTip"))}">${t("js.tamperRehashBtn")}</button>`
      : "";
  return `<div class="${cls}">
    <span class="from">${coinbase ? "⛏ COINBASE" : esc(tx.from)}</span>
    <span class="arrow">→</span>
    <span class="to">${esc(tx.to)}</span>
    <span class="amount">${fmtBtc(tx.amount)} BTC</span>
    ${tamperBtns}
  </div>`;
}

function renderChain(chain) {
  const box = $("chain");
  box.innerHTML = chain
    .map((block, i) => {
      const isGenesis = block.id === 0;

      // JS에서 블록 해시를 다시 계산해, 저장된 해시와 다르면 "위변조"로 표시
      const txData = block.transactions.map(txToHashString).join("|");
      const preimage = `${block.id}${block.timestamp}${txData}${block.previous_hash}${block.nonce}`;
      const recomputed = sha256(preimage);
      const tampered = recomputed !== block.hash;

      // 이전 블록과의 연결 확인
      const linkBroken = i > 0 && block.previous_hash !== chain[i - 1].hash;

      // 작업증명(PoW) 확인: 저장된 해시가 이 블록의 난이도만큼 0으로 시작하나?
      // (제네시스는 엔진 검증과 동일하게 건너뜀)
      const target = "0".repeat(block.difficulty || 0);
      const powBad = !isGenesis && (block.difficulty || 0) > 0 && !block.hash.startsWith(target);

      const bad = tampered || linkBroken || powBad;

      const txs = block.transactions.length
        ? block.transactions
            .map((tx, ti) =>
              txRow(tx, {
                tamperKey: `${i}:${ti}`,
                tampered: tampered || powBad,
              })
            )
            .join("")
        : `<div class="empty">${t("js.noTxsGenesis")}</div>`;

      const link =
        i > 0
          ? `<div class="link-down" title="${esc(t("js.linkTip"))}"></div>`
          : "";

      return `${link}
      <div class="block-wrap">
        <div class="block ${isGenesis ? "genesis" : ""} ${bad ? "tampered" : ""}">
          <div class="block-head">
            <span class="id">Block #${block.id}</span>
            ${isGenesis ? `<span class="tag">${t("js.genesisTag")}</span>` : ""}
            <span class="tag nonce">nonce ${fmtInt(block.nonce)}</span>
            <span class="tag time">${fmtTime(block.timestamp)}</span>
            ${tampered ? `<span class="tag" style="color:var(--red)">${t("js.tamperedTag")}</span>` : ""}
            ${powBad ? `<span class="tag" style="color:var(--red)">${t("js.powBadTag")}</span>` : ""}
          </div>
          <div class="block-field">
            <span class="lbl">${t("mc.thisHash")}</span>
            <span class="hash-pill self ${powBad ? "bad" : ""}">${hlLeadingZeros(block.hash)}</span>
          </div>
          ${
            tampered
              ? `<div class="block-field">
                  <span class="lbl" style="color:var(--red)">${t("js.recomputedLbl")}</span>
                  <span class="hash-pill bad">${esc(recomputed)}</span>
                </div>`
              : ""
          }
          ${
            powBad
              ? `<div class="block-field">
                  <span class="lbl" style="color:var(--red)">${t("js.requiredLbl")}</span>
                  <span class="hash-pill bad">${t("js.requiredVal", { target: esc(target), d: block.difficulty })}</span>
                </div>`
              : ""
          }
          <div class="block-field">
            <span class="lbl">${t("mc.prevHash")}</span>
            <span class="hash-pill prev ${linkBroken ? "bad" : ""}">${esc(block.previous_hash)}</span>
          </div>
          <div class="txs">${txs}</div>
        </div>
      </div>`;
    })
    .join("");
}

function updateAddrList(s) {
  const names = new Set(["Satoshi", "Alice", "Bob", "Charlie", "Dave"]);
  s.balances.forEach((b) => names.add(b.address));
  $("addrList").innerHTML = [...names].map((n) => `<option value="${esc(n)}">`).join("");
}

// ---------- 채굴 애니메이션 ----------
function mineBlock() {
  if (engine.is_mining()) return;
  const miner = $("minerAddr").value.trim() || "Satoshi";

  const info = JSON.parse(engine.begin_mine(miner));
  pullLogs();

  const stage = $("chainMiner");
  stage.style.display = "block";
  $("cmTarget").textContent = info.target;
  $("mineBtn").disabled = true;
  $("txAdd").disabled = true;

  const startTime = performance.now();
  const BATCH = 15000;

  const tick = () => {
    const res = JSON.parse(engine.mine_step(BigInt(BATCH)));
    const elapsed = (performance.now() - startTime) / 1000;
    $("cmNonce").textContent = fmtInt(res.nonce);
    $("cmAttempts").textContent = fmtInt(res.attempts);
    $("cmRate").textContent = fmtInt(Math.round(res.attempts / Math.max(elapsed, 0.001)));
    $("cmHash").innerHTML = hlLeadingZeros(res.hash);

    if (res.found) {
      $("cmHash").classList.add("found");
      setTimeout(() => {
        stage.style.display = "none";
        $("cmHash").classList.remove("found");
        $("mineBtn").disabled = false;
        $("txAdd").disabled = false;
        pullLogs();
        render();
      }, 600);
      return;
    }
    requestAnimationFrame(tick);
  };
  tick();
}

// ---------- 검증 ----------
function runValidate() {
  const r = JSON.parse(engine.validate());
  const box = $("verdict");
  box.style.display = "flex";
  if (r.valid) {
    box.className = "verdict ok";
    box.innerHTML = `<span class="icon">✅</span><div><b>${t("js.chainOk")}</b><br><span class="small">${esc(trEngine(r.reason))}</span></div>`;
  } else {
    box.className = "verdict bad";
    box.innerHTML = `<span class="icon">🚫</span><div><b>${t("js.chainBad")}</b><br><span class="small">${esc(trEngine(r.reason))}</span></div>`;
  }
}

// ---------- 위변조 ----------
// rehash=false: 데이터만 바꾸고 해시는 그대로 → 검증 ①(해시 불일치)에서 걸림
// rehash=true : 바꾼 뒤 해시도 다시 계산(채굴은 생략) → 검증 ③(작업증명)에서 걸림
function doTamper(blockIndex, txIndex, rehash = false) {
  const s = snap();
  const tx = s.chain[blockIndex].transactions[txIndex];
  const newTo = prompt(t("js.tamperPromptTo", { cur: tx.to }), tx.to);
  if (newTo === null) return;
  const newAmountStr = prompt(t("js.tamperPromptAmt", { cur: tx.amount }), tx.amount);
  if (newAmountStr === null) return;
  const newAmount = Number(newAmountStr);
  if (Number.isNaN(newAmount)) return;

  if (rehash) {
    engine.tamper_rehash(blockIndex, txIndex, newTo, newAmount);
  } else {
    engine.tamper(blockIndex, txIndex, newTo, newAmount);
  }
  $("verdict").style.display = "none";
  render();
  // 위변조 직후 안내
  flashTxMsg(rehash ? "js.tamperedRehashMsg" : "js.tamperedMsg", undefined, false);
}

// ---------- 로그 콘솔 ----------
function csLogClass(line) {
  let cls = "";
  if (line.includes("[TX]")) cls = "tx";
  else if (line.includes("[REJECTED]")) cls = "reject";
  else if (line.includes("[MINING]") || line.includes("[MINED]")) cls = "mine";
  else if (line.includes("난이도")) cls = "diff";
  else if (line.includes("[INIT]")) cls = "init";
  return `line ${cls}`;
}

function pullLogs() {
  appendEngineLogs("console", JSON.parse(engine.take_logs()), csLogClass);
}

function flashTxMsg(key, params, ok) {
  sticky("txMsg", () => {
    const el = $("txMsg");
    el.textContent = t(key, params);
    el.style.color = ok ? "var(--green)" : "var(--red)";
  });
}

// ============================================================
// 탭 4 — UTXO 모델
// ============================================================
let utxo = null; // WasmUtxo 인스턴스

function setupUtxo() {
  utxo = new WasmUtxo();

  $("uFundBtn").addEventListener("click", () => {
    const addr = $("uFundAddr").value.trim();
    const amt = Number($("uFundAmt").value);
    if (!addr || !(amt > 0)) return;
    utxo.fund(addr, amt);
    pullUtxoLogs();
    renderUtxoPool({ flashKeysFromLastFund: true });
  });

  $("uSendBtn").addEventListener("click", doUtxoSend);
  $("uForgeBtn").addEventListener("click", doUtxoForge);

  // "원문을 직접 SHA-256으로 돌려보기" — 서명 블록이 동적 생성되므로 이벤트 위임
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".sig-hash-btn");
    if (!btn) return;
    // 입력별 카드가 여러 개이므로, 이 버튼이 속한 카드(.sig-mini)로 범위를 좁힌다.
    const box = btn.closest(".sig-mini") || btn.closest(".sig-box");
    if (!box) return;
    const calc = sha256(btn.dataset.msg || ""); // WASM의 SHA-256 (엔진과 동일한 함수)
    const match = calc === (btn.dataset.sighash || "");
    box.querySelector(".sig-hash-calc").textContent = calc;
    box.querySelector(".sig-hash-cmp").innerHTML = match
      ? `<span class="cmp ok">${t("js.sigHashOk")}</span>`
      : `<span class="cmp bad">${t("js.sigHashBad")}</span>`;
  });
  $("uReset").addEventListener("click", () => {
    utxo.free?.();
    utxo = new WasmUtxo();
    clearEngineLog("uConsole");
    clearSticky("uMsg", "uFlow", "uForge");
    $("uFlowCard").style.display = "none";
    $("uMsg").textContent = "";
    $("uForgeResult").innerHTML = "";
    $("uForgeSig").style.display = "none";
    $("uSigBlock").style.display = "none";
    renderUtxoPool();
  });

  renderUtxoPool();
}

// 주소(1xxxx…) → 사람 이름(라벨) 매핑. 현재 스냅샷 기준.
let addrToLabel = new Map();

function uSnap() {
  return JSON.parse(utxo.snapshot());
}

// 동전 칩 하나의 HTML
function coinChip(u, opts = {}) {
  const cls = [
    "coin",
    opts.change ? "change" : "",
    opts.recipient ? "recipient" : "",
    opts.spent ? "spent" : "",
    opts.flash ? "flash-in" : "",
  ].join(" ");
  const role = opts.roleText ? `<span class="role">${opts.roleText}</span>` : "";
  const full = `${u.txid}:${u.vout}`;
  // 이 동전이 "잠긴 주소"(= 공개키 해시). 주인 확인의 기준이라 거래 흐름 칩에 함께 표시.
  const lock =
    opts.showAddr && u.address
      ? `<span class="lock" title="${esc(t("js.coinLockTip", { addr: u.address }))}">🔒 ${esc(
          shortAddr(u.address)
        )}${copyBtn(u.address, "inline-copy")}</span>`
      : "";
  return `<div class="${cls}" data-key="${esc(u.key)}">
    <span class="amt">${fmtBtc(u.amount)}<small> BTC</small></span>
    <span class="id" title="${esc(full)}">${esc(String(u.txid).slice(0, 6))}…:${u.vout}</span>
    ${role}
    ${lock}
    ${copyBtn(full, "coin-copy")}
  </div>`;
}

let lastCreatedKeys = new Set();

function renderUtxoPool(opts = {}) {
  const s = uSnap();
  const box = $("uPool");

  // 주소 ↔ 라벨 매핑 갱신
  addrToLabel = new Map();
  (s.wallets || []).forEach((w) => addrToLabel.set(w.address, w.label));

  // 입력칸 자동완성: 사람 이름(라벨) 위주
  const names = new Set(["Alice", "Bob", "Carol", "Dave", "Hacker", "Miner1"]);
  (s.wallets || []).forEach((w) => names.add(w.label));
  $("uAddrList").innerHTML = [...names].map((n) => `<option value="${esc(n)}">`).join("");

  // 지갑 카드
  renderWallets(s);

  if (!s.utxos.length) {
    box.innerHTML = `<div class="empty">${t("ux.poolEmpty")}</div>`;
    return;
  }

  // 주소별로 묶기
  const byOwner = new Map();
  for (const u of s.utxos) {
    if (!byOwner.has(u.address)) byOwner.set(u.address, []);
    byOwner.get(u.address).push(u);
  }

  box.innerHTML = [...byOwner.entries()]
    .map(([addr, coins]) => {
      const total = coins.reduce((a, c) => a + c.amount, 0);
      const label = labelOf(addr);
      const isMiner = /miner|hacker/i.test(label);
      const chips = coins
        .map((c) =>
          coinChip(c, { flash: opts.flashAll || lastCreatedKeys.has(c.key) })
        )
        .join("");
      return `<div class="utxo-owner">
        <div class="who ${isMiner ? "miner" : ""}">
          <span class="who-name">${esc(label)}</span>
          <span class="who-addr" title="${esc(addr)}">${esc(shortAddr(addr))}${copyBtn(addr, "inline-copy")}</span>
          <span class="sum">${t("js.ownerSum", { bal: fmtBtc(total), n: coins.length })}</span>
        </div>
        <div class="coins">${chips}</div>
      </div>`;
    })
    .join("");

  lastCreatedKeys = new Set(); // flash는 한 번만
}

function labelOf(addr) {
  return addrToLabel.get(addr) || addr;
}
function shortAddr(addr) {
  return String(addr).length > 12 ? String(addr).slice(0, 12) + "…" : addr;
}

// 지갑(키쌍) 목록 렌더
function renderWallets(s) {
  const box = $("uWallets");
  const wallets = s.wallets || [];
  if (!wallets.length) {
    box.innerHTML = `<div class="empty">${t("ux.walletEmpty")}</div>`;
    return;
  }
  const balByAddr = new Map((s.balances || []).map((b) => [b.address, b.amount]));
  box.className = "wallets";
  box.innerHTML = wallets
    .map((w) => {
      const bal = balByAddr.get(w.address) || 0;
      return `<div class="wallet">
        <div class="w-name"><span class="w-key">🔑</span>${esc(w.label)}</div>
        <div>
          <div class="w-row"><span class="w-tag">${t("js.wAddr")}</span><span class="w-addr">${esc(w.address)}${copyBtn(w.address, "inline-copy")}</span></div>
          <div class="w-row"><span class="w-tag">${t("js.wPub")}</span><span class="w-pub">${esc(w.pubkey)}${copyBtn(w.pubkey, "inline-copy")}</span></div>
          <div class="w-row"><span class="w-tag">${t("js.wBal")}</span><span class="w-bal">${fmtBtc(bal)} BTC</span></div>
        </div>
      </div>`;
    })
    .join("");
}

function doUtxoSend() {
  const from = $("uFrom").value.trim();
  const to = $("uTo").value.trim();
  const amount = Number($("uAmt").value);
  const fee = Number($("uFee").value) || 0;
  const msg = $("uMsg");

  if (!from || !to || !(amount > 0)) {
    sticky("uMsg", () => {
      msg.style.color = "var(--red)";
      msg.textContent = t("js.txInvalid");
    });
    return;
  }

  const r = JSON.parse(utxo.send(from, to, amount, fee));
  if (!r.ok) {
    sticky("uMsg", () => {
      msg.style.color = "var(--red)";
      msg.textContent = t("js.sendRejected", { err: trEngine(r.error) });
    });
    pullUtxoLogs();
    return;
  }
  sticky("uMsg", () => {
    msg.style.color = "var(--green)";
    msg.textContent = t("js.sendOk", { nIn: r.spent.length, nOut: r.created.length });
  });

  // 1) 거래 다이어그램 표시 (언어 전환 시 같은 데이터로 다시 그림)
  sticky("uFlow", () => renderUtxoFlow(r, from, to));

  // 2) 풀에서 소비된 동전 강조 후, 잠시 뒤 새 상태로 갱신
  const spentKeys = new Set(r.spent.map((u) => u.key));
  document.querySelectorAll("#uPool .coin").forEach((el) => {
    if (spentKeys.has(el.dataset.key)) el.classList.add("spending");
  });

  lastCreatedKeys = new Set(r.created.map((u) => u.key));
  setTimeout(() => {
    pullUtxoLogs();
    renderUtxoPool();
  }, 750);
}

function renderUtxoFlow(r, from, to) {
  $("uFlowCard").style.display = "block";
  $("uFlowTxid").textContent = "txid " + r.txid.slice(0, 12) + "…";

  $("uFlowInputs").innerHTML = r.spent
    .map((u) => coinChip(u, { spent: true, showAddr: true, roleText: t("js.ownedBy", { who: from }) }))
    .join("");
  const inSum = r.spent.reduce((a, c) => a + c.amount, 0);
  $("uFlowInSum").innerHTML = t("js.sumBtc", { amt: fmtBtc(inSum) });

  $("uFlowOutputs").innerHTML = r.created
    .map((u) =>
      coinChip(u, {
        change: u.change,
        recipient: !u.change,
        flash: true,
        showAddr: true,
        roleText: u.change ? t("js.changeTo", { who: from }) : `→ ${to}`,
      })
    )
    .join("");
  const outSum = r.created.reduce((a, c) => a + c.amount, 0);
  $("uFlowOutSum").innerHTML = t("js.sumBtc", { amt: fmtBtc(outSum) });

  $("uFlowEq").innerHTML = t("js.flowEq", {
    inSum: fmtBtc(inSum),
    outSum: fmtBtc(outSum),
    fee: fmtBtc(r.fee),
  });

  renderSigBlock(r);
}

// 주소 뒤에 "(= 이름)" 라벨을 붙여 HTML로 (스크롤 없이 누구 건지 바로 보이게)
function addrLabelHtml(addr) {
  const who = addrToLabel.get(addr);
  return `${esc(addr)}${who ? ` <span class="who">(= ${esc(who)})</span>` : ""}`;
}

// 주소↔이름 매핑 최신화 (서명 블록 안에서 바로 이름 표시)
function refreshAddrLabels() {
  const s = uSnap();
  addrToLabel = new Map();
  (s.wallets || []).forEach((w) => addrToLabel.set(w.address, w.label));
}

// 서명 대상 원문을 사람이 읽기 쉬운 항목으로 분해 (이름 라벨 포함)
function sigMsgLegend(message, signerAddress) {
  const parts = String(message).split(";").filter(Boolean);
  const items = parts.map((p) => {
    if (p.startsWith("in:")) {
      const [, txid, vout] = p.split(":");
      return `<div class="leg-in">${t("js.legIn")} <span class="mono">${esc(
        (txid || "").slice(0, 14)
      )}…:${esc(vout || "")}</span></div>`;
    }
    if (p.startsWith("out:")) {
      const [, addr, amt] = p.split(":");
      const isChange = signerAddress && addr === signerAddress;
      const role = isChange ? t("js.legOutChange") : t("js.legOutRecv");
      return `<div class="leg-out">${t("js.legOut")} · ${role} <span class="mono">${addrLabelHtml(
        addr || ""
      )}</span> ← <b>${esc(amt || "")}</b> BTC</div>`;
    }
    if (p.startsWith("spending:")) {
      const [, txid, vout] = p.split(":");
      return `<div class="leg-spend">${t("js.legSpending")} <span class="mono">${esc(
        (txid || "").slice(0, 14)
      )}…:${esc(vout || "")}</span> <span class="muted">${t("js.legSpendingNote")}</span></div>`;
    }
    return `<div>${esc(p)}</div>`;
  });
  return items.join("");
}

// 입력(소비할 UTXO) 하나에 대한 서명·검증 카드 HTML
function sigInputCardHTML(s, idx) {
  const sig = s.signature || "";
  const rHex = sig.slice(0, 64);
  const sHex = sig.slice(64);
  const outpoint = `${s.txid}:${s.vout}`;
  const aOk = !!s.ownerOk;
  const bOk = !!s.sigOk;

  const aRow = aOk
    ? `<div><b>${t("js.vOwner")}</b> ✅ — ${t("js.vOwnerOk1")} <span class="mono">${addrLabelHtml(
        s.signerAddress
      )}</span> <b>==</b> ${t("js.vOwnerOk2")} <span class="mono">${addrLabelHtml(
        s.lockAddress
      )}</span></div>`
    : `<div class="vfail"><b>${t("js.vOwner")}</b> ❌ — ${t("js.vOwnerBad1")} <span class="mono">${addrLabelHtml(
        s.signerAddress
      )}</span> <b>≠</b> ${t("js.vOwnerOk2")} <span class="mono">${addrLabelHtml(
        s.lockAddress
      )}</span> <span class="muted">${t("js.vOwnerBad2")}</span></div>`;

  const bRow = aOk
    ? bOk
      ? `<div><b>${t("js.vConsent")}</b> ✅ — ${t("js.vConsentOk")}</div>`
      : `<div class="vfail"><b>${t("js.vConsent")}</b> ❌ — ${t("js.vConsentBad")}</div>`
    : `<div class="vskip"><b>${t("js.vConsent")}</b> — <span class="muted">${t("js.vConsentSkip")}</span></div>`;

  const cardCls = aOk && bOk ? "sig-input-card ok" : "sig-input-card bad";

  return `
  <div class="${cardCls}">
    <div class="sig-input-head">
      <span class="sig-input-no">${t("js.inputNo", { n: idx + 1 })}</span>
      <span class="mono sig-input-outpoint" title="${esc(outpoint)}">${t("js.outpoint")} ${esc(
    String(s.txid).slice(0, 10)
  )}…:${s.vout}${copyBtn(outpoint, "inline-copy")}</span>
      <span class="muted small">${t("js.lockAddr")} <span class="mono">${addrLabelHtml(s.lockAddress)}</span></span>
    </div>

    <div class="sig-mini">
      <div class="sig-mini-h">${t("js.sig1H")}</div>
      <div class="mono small sig-msg">${esc(s.message)}${copyBtn(s.message, "inline-copy")}</div>
      <div class="sig-msg-legend">${sigMsgLegend(s.message, s.signerAddress)}</div>
      <button class="btn ghost sm sig-hash-btn" data-msg="${esc(s.message)}" data-sighash="${esc(
    s.sighash
  )}" style="margin-top:6px">${t("js.sigHashBtn")}</button>
      <div class="sig-sub-label" style="margin-top:6px">${t("js.sigCalcLbl")}</div>
      <div class="mono small sig-hash-calc"><span class="muted">${t("js.sigCalcHint")}</span></div>
      <div class="sig-sub-label" style="margin-top:6px">${t("js.sigEngineLbl")}</div>
      <div class="mono small">${esc(s.sighash)}${copyBtn(s.sighash, "inline-copy")}</div>
      <div class="sig-hash-cmp"></div>
    </div>

    <div class="sig-mini">
      <div class="sig-mini-h">${t("js.sig2H", { who: esc(s.signerLabel || "?") })}</div>
      <div class="muted small" style="margin-bottom:4px">${t("js.sig2Note")}</div>
      <div class="sig-sub-label">${t("js.sigR")}</div>
      <div class="mono small">${esc(rHex)}${copyBtn(rHex, "inline-copy")}</div>
      <div class="sig-sub-label" style="margin-top:4px">${t("js.sigS")}</div>
      <div class="mono small">${esc(sHex)}${copyBtn(sHex, "inline-copy")}</div>
      <div class="sig-sub-label" style="margin-top:4px">${t("js.sigQ")}</div>
      <div class="mono small">${esc(s.pubkey)}${copyBtn(s.pubkey, "inline-copy")}</div>
    </div>

    <div class="sig-mini">
      <div class="sig-mini-h">${t("js.sig3H")}</div>
      <div class="sig-verify-rows">
        ${aRow}
        ${bRow}
      </div>
    </div>
  </div>`;
}

// 서명/검증 블록 전체 HTML (입력마다 카드 하나. 실제 비트코인처럼 입력별 서명)
function sigBlockHTML(r) {
  const inputs = r.inputsSig || [];
  const cards = inputs.map((s, i) => sigInputCardHTML(s, i)).join("");
  const multi = inputs.length > 1;

  const verdict = r.verified
    ? `<div class="sig-verdict ok">${t("js.sigVerdictOk", { n: inputs.length })}</div>`
    : `<div class="sig-verdict bad">${t("js.sigVerdictBad", {
        err: esc(r.error ? trEngine(r.error) : t("js.sigInvalid")),
      })}</div>`;

  return `
    <div class="sig-title">${t("js.sigTitle")}</div>
    <div class="muted small" style="margin-bottom:10px">
      ${t("js.sigIntro")}${
        multi ? t("js.sigMulti", { n: inputs.length }) : t("js.sigSingle")
      }
    </div>
    <div class="sig-input-cards">${cards}</div>
    <details class="aside" style="margin-top:10px">
      <summary>${t("js.sigAsideSummary")}</summary>
      <div class="aside-body">${t("js.sigAsideBody")}</div>
    </details>
    ${verdict}`;
}

// 서명/검증 블록을 지정한 컨테이너에 렌더 (송금·도둑질 공용)
function renderSigInto(id, r) {
  const box = $(id);
  if (!box) return;
  if (!r.sighash) {
    box.style.display = "none";
    return;
  }
  refreshAddrLabels();
  box.style.display = "block";
  box.innerHTML = sigBlockHTML(r);
}

function renderSigBlock(r) {
  renderSigInto("uSigBlock", r);
}

// 위조(도둑질) 시도
function doUtxoForge() {
  const attacker = $("uForgeAttacker").value.trim();
  const victim = $("uForgeVictim").value.trim();
  const amount = Number($("uForgeAmt").value);
  const box = $("uForgeResult");

  if (!attacker || !victim || !(amount > 0)) {
    sticky("uForge", () => {
      box.innerHTML = `<div class="forge-verdict">${t("js.forgeInvalid")}</div>`;
    });
    return;
  }
  if (attacker === victim) {
    sticky("uForge", () => {
      box.innerHTML = `<div class="forge-verdict">${t("js.forgeSame")}</div>`;
    });
    return;
  }

  // 공격자는 자기 앞으로(attacker → attacker) 피해자 동전을 보내려 시도
  const r = JSON.parse(utxo.forge(attacker, victim, attacker, amount));
  pullUtxoLogs();

  if (!r.sighash) {
    // 검증 이전 단계에서 막힘 (예: 피해자 UTXO 부족)
    sticky("uForge", () => {
      box.innerHTML = `<div class="forge-verdict">${t("js.forgeFailPre", { err: esc(trEngine(r.error || "")) })}</div>`;
      renderSigInto("uForgeSig", { sighash: "" }); // 숨김
    });
    return;
  }

  if (r.verified) {
    sticky("uForge", () => {
      box.innerHTML = `<div class="forge-verdict ok">${t("js.forgePassed")}</div>`;
    });
    renderUtxoPool();
    return;
  }

  sticky("uForge", () => {
    box.innerHTML = `<div class="forge-verdict">${t("js.forgeRejected", {
      attacker: esc(attacker),
      victim: esc(victim),
      amt: fmtBtc(amount),
    })}</div>`;
    // 송금과 동일한 서명/검증 블록을 렌더 → ③(a) 주소 불일치로 실패하는 게 보임
    renderSigInto("uForgeSig", r);
  });
  // 검증 실패라 UTXO 상태는 그대로
}

function uLogClass(line) {
  let cls = "mine";
  if (line.includes("[거래]")) cls = "tx";
  else if (line.includes("[위조 거부]")) cls = "reject";
  else if (line.includes("[발행]") || line.includes("[지갑]")) cls = "init";
  return `line ${cls}`;
}

function pullUtxoLogs() {
  appendEngineLogs("uConsole", JSON.parse(utxo.take_logs()), uLogClass);
}

// ============================================================
// 탭 5 — 블록 해부 (머클트리 · 헤더 · double SHA-256 · target)
// ============================================================
let anMiner = null; // WasmHeaderMiner
let anMining = false;
let anRaf = 0;
let anLastRoot = "";

function setupAnatomy() {
  $("anBuildBtn").addEventListener("click", buildMerkle);
  $("anAssembleBtn").addEventListener("click", assembleHeader);
  $("anMineBtn").addEventListener("click", startAnMine);
  $("anStopBtn").addEventListener("click", stopAnMine);
  buildMerkle(); // 기본 거래로 한 번 그려둠
}

function anReadTxs() {
  return $("anTxs").value
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function buildMerkle() {
  const txs = anReadTxs();
  const info = $("anMkInfo");
  if (!txs.length) {
    info.textContent = t("js.anNoTxs");
    $("anMerkle").innerHTML = "";
    $("anRootLine").style.display = "none";
    return;
  }
  const mk = JSON.parse(merkle_tree(JSON.stringify(txs)));
  anLastRoot = mk.root;
  renderMerkle(mk);
  info.textContent = t("js.anMkInfo", { n: mk.txCount, lv: mk.levels.length });
  $("anRoot").textContent = mk.root;
  $("anRootLine").style.display = "flex";
}

function shortHash(h, n = 10) {
  return String(h).slice(0, n) + "…";
}

function renderMerkle(mk) {
  const box = $("anMerkle");
  const levels = mk.levels;
  const top = levels.length - 1; // 루트 층 인덱스
  let html = "";
  for (let i = top; i >= 0; i--) {
    const isRoot = i === top;
    const isLeaf = i === 0;
    const nodes = levels[i];

    let chips = nodes
      .map((h, idx) => {
        const cls = isRoot ? "root" : isLeaf ? "leaf" : "";
        const tag = isRoot ? "ROOT" : isLeaf ? `tx ${idx + 1}` : `H${idx + 1}`;
        return `<div class="mk-node ${cls}" title="${esc(h)}">
          <span class="mk-hash">${shortHash(h, 8)}</span>
          <span class="mk-tag">${tag}</span>
        </div>`;
      })
      .join("");

    // 홀수 개수(>1)인 자식 층은 마지막 노드를 복제해 짝을 맞춤 → 복제본을 흐리게 표시
    if (!isRoot && nodes.length > 1 && nodes.length % 2 === 1) {
      const last = nodes[nodes.length - 1];
      chips += `<div class="mk-node dup" title="${esc(t("js.mkDupTip"))}\n${esc(last)}">
        <span class="mk-hash">${shortHash(last, 8)}</span>
        <span class="mk-tag">${t("js.mkDupTag")}</span>
      </div>`;
    }

    html += `<div class="merkle-level ${isRoot ? "is-root" : ""}">${chips}</div>`;
    if (i > 0) html += `<div class="merkle-connector">${t("js.mkConnector")}</div>`;
  }
  box.innerHTML = html;
}

function assembleHeader() {
  const txs = anReadTxs();
  if (!txs.length) {
    alert(t("js.anNeedTxs"));
    return;
  }
  // 머클트리도 현재 거래로 갱신
  buildMerkle();

  let prev = $("anPrev").value.trim().toLowerCase().replace(/[^0-9a-f]/g, "");
  if (!prev) prev = "0".repeat(64);
  prev = (prev + "0".repeat(64)).slice(0, 64);

  let bits = Math.floor(Number($("anBits").value) || 20);
  bits = Math.max(1, Math.min(28, bits));

  stopAnMine();
  anMiner = new WasmHeaderMiner(prev, JSON.stringify(txs), bits);
  const info = JSON.parse(anMiner.info());
  renderHeader(info);
  $("anHeaderBox").style.display = "block";
  $("anMineCard").style.display = "block";

  // 채굴 패널 초기화 (언어 전환 시에도 같은 상태로 다시 칠함)
  sticky("anStep", () => {
    $("anDStep0").textContent = "—";
    $("anDStep1").textContent = "—";
    $("anDStep2").textContent = "—";
    $("anCmpHash").textContent = "—";
    $("anCmpTarget").innerHTML = hlLeadingZeros(info.targetHex);
    $("anCmpVerdict").className = "cmp-verdict";
    $("anCmpVerdict").textContent = t("js.anIdleVerdict");
    $("anMineStat").textContent = "";
  });
  $("anMineBtn").disabled = false;
}

function renderHeader(info) {
  const fields = [
    { name: "version", size: "4 B", val: info.version, cls: "" },
    { name: "prev_hash", size: "32 B", val: info.prevHash, cls: "" },
    { name: "merkle_root", size: "32 B", val: info.merkleRoot, cls: "accent-merkle" },
    { name: "timestamp", size: "4 B", val: `${info.timestamp} (${new Date(info.timestamp * 1000).toLocaleString(uiLocale())})`, cls: "" },
    { name: "bits", size: "4 B", val: t("js.hdrBits", { n: info.zeroBits }), cls: "" },
    { name: "nonce", size: "4 B", val: `${info.nonce}  ${t("js.hdrNonce")}`, cls: "accent-nonce" },
  ];
  $("anHdrFields").innerHTML = fields
    .map(
      (f) => `<div class="hdr-field ${f.cls}">
        <span class="hf-name">${f.name}</span>
        <span class="hf-size">${f.size}</span>
        <span class="hf-val">${esc(String(f.val))}</span>
      </div>`
    )
    .join("");

  $("anHdrHex").innerHTML = hlLeadingZeros(info.headerHex);
  $("anTargetHex").innerHTML = hlLeadingZeros(info.targetHex);

  const exp = info.expectedHashes;
  const expStr = exp >= 1000 ? Math.round(exp).toLocaleString(uiLocale()) : Math.round(exp).toString();
  $("anExpected").textContent = t("js.anExpected", { bits: info.zeroBits, n: expStr });
}

function startAnMine() {
  if (!anMiner || anMining) return;
  anMining = true;
  $("anMineBtn").disabled = true;
  $("anStopBtn").disabled = false;

  const loop = () => {
    if (!anMining) return;
    const r = JSON.parse(anMiner.step(40000));
    sticky("anStep", () => {
      renderAnStep(r);
      $("anMineStat").textContent = r.found
        ? t("js.anFound", { nonce: fmtInt(r.nonce), n: fmtInt(r.attempts) })
        : t("js.anTrying", { nonce: fmtInt(r.nonce) });
    });
    if (r.found) {
      anMining = false;
      $("anStopBtn").disabled = true;
      return;
    }
    anRaf = requestAnimationFrame(loop);
  };
  anRaf = requestAnimationFrame(loop);
}

function stopAnMine() {
  anMining = false;
  if (anRaf) cancelAnimationFrame(anRaf);
  anRaf = 0;
  const stop = $("anStopBtn");
  if (stop) stop.disabled = true;
  const mine = $("anMineBtn");
  if (mine && anMiner) mine.disabled = false;
}

function renderAnStep(r) {
  $("anDStep0").innerHTML = hlLeadingZeros(r.headerHex);
  $("anDStep1").textContent = r.hashOnce;
  $("anDStep2").innerHTML = hlLeadingZeros(r.hash);

  $("anCmpHash").innerHTML = hlLeadingZeros(r.hash);
  $("anCmpTarget").innerHTML = hlLeadingZeros(r.targetHex);

  const v = $("anCmpVerdict");
  if (r.meets) {
    v.className = "cmp-verdict ok";
    v.innerHTML = t("js.anMeets");
  } else {
    v.className = "cmp-verdict bad";
    v.innerHTML = t("js.anNotMeets");
  }
}

// ============================================================
// 6번 탭: 노드 합의 (P2P) — 여러 노드 · 방송 · 가장 긴 체인
// ============================================================
let netEngine = null; // WasmNetwork 핸들
let netState = null; // 마지막 스냅샷(파싱됨)
let netBusy = false; // 자동 시연 중 중복 실행 방지

function setupNetwork() {
  $("netResetBtn").addEventListener("click", () => {
    if (netBusy) return;
    netBuild();
  });
  $("netScenarioBtn").addEventListener("click", netScenario);

  // 노드별 채굴/방송 버튼(동적 생성)은 위임으로 처리
  $("netNodes").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-net]");
    if (!b || !netEngine || netBusy) return;
    const idx = Number(b.dataset.idx);
    if (b.dataset.net === "mine") netApply(netEngine.mine_on(idx));
    else netApply(netEngine.broadcast(idx));
  });

  netBuild();
}

// 입력값(노드 수·난이도)으로 네트워크를 새로 만든다.
function netBuild() {
  const count = Math.max(2, Math.min(5, Number($("netNodeCount").value) || 3));
  const diff = Math.max(1, Math.min(5, Number($("netDifficulty").value) || 3));
  const names = [];
  for (let i = 0; i < count; i++) names.push("Node " + String.fromCharCode(65 + i));
  netEngine = new WasmNetwork(JSON.stringify(names), diff);
  clearEngineLog("netLog");
  netApply(netEngine.snapshot());
}

function netApply(json) {
  netState = JSON.parse(json);
  renderNet();
  pullNetLogs();
}

function renderNet() {
  const wrap = $("netNodes");
  if (!netState) {
    wrap.innerHTML = "";
    return;
  }
  const nodes = netState.nodes;

  // 높이(height)별로 어떤 해시들이 있는지 모아 "합의 vs 포크"를 판정한다.
  // 그 높이에 해시가 딱 1종류면 모두 동의(agreed), 2종류 이상이면 포크(fork).
  const byHeight = new Map();
  let longest = 0;
  nodes.forEach((n) => {
    longest = Math.max(longest, n.blocks.length);
    n.blocks.forEach((b, h) => {
      if (!byHeight.has(h)) byHeight.set(h, new Set());
      byHeight.get(h).add(b.hash);
    });
  });

  wrap.innerHTML = nodes
    .map((n, idx) => {
      const isLongest = n.blocks.length === longest && longest > 1;
      const blocks = n.blocks
        .map((b, h) => {
          const agreed = byHeight.get(h).size === 1;
          const isTip = h === n.blocks.length - 1;
          let cls = b.isGenesis ? "nb-genesis" : agreed ? "nb-agreed" : "nb-fork";
          if (isTip && !b.isGenesis) cls += " nb-tip";
          const label = b.isGenesis ? t("js.genesisTag") : `#${b.id}`;
          const miner = b.isGenesis ? "" : `<span class="nb-miner">⛏ ${esc(b.miner)}</span>`;
          const tip = new Set(byHeight.get(h)).size > 1 && !b.isGenesis;
          return `<div class="net-block ${cls}" title="hash: ${esc(b.hash)}&#10;prev: ${esc(
            b.prevHash
          )}&#10;nonce: ${b.nonce}">
            <span class="nb-id">${label}${tip ? ` <span class="nb-forktag">${t("js.forkTag")}</span>` : ""}</span>
            ${miner}
            <span class="nb-hash mono">${esc(b.hash.slice(0, 12))}…${copyBtn(b.hash)}</span>
          </div>`;
        })
        .join('<span class="net-link">→</span>');

      return `<div class="net-node ${isLongest ? "is-longest" : ""}">
        <div class="net-node-head">
          <span class="net-node-name">${esc(n.name)}</span>
          <span class="net-node-height">${t("js.heightLbl", { h: n.height })}${isLongest ? t("js.longestTag") : ""}</span>
          <span class="net-node-actions">
            <button class="btn sm" data-net="mine" data-idx="${idx}">${t("js.mineBtn")}</button>
            <button class="btn sm green" data-net="bcast" data-idx="${idx}">${t("js.bcastBtn")}</button>
          </span>
        </div>
        <div class="net-chain-scroll"><div class="net-chain">${blocks}</div></div>
      </div>`;
    })
    .join("");
}

function pullNetLogs() {
  if (!netEngine) return;
  let logs;
  try {
    logs = JSON.parse(netEngine.take_logs());
  } catch {
    return;
  }
  appendEngineLogs("netLog", logs, netLogClass);
}

function netLogClass(line) {
  let cls = "";
  if (line.includes("재구성") || line.includes("orphan")) cls = "lg-reorg";
  else if (line.includes("방송")) cls = "lg-cast";
  else if (line.includes("채굴")) cls = "lg-mine";
  else if (line.includes("포크")) cls = "lg-fork";
  else if (line.includes("거부") || line.includes("무효")) cls = "lg-bad";
  return "net-log-line " + cls;
}

// 포크 → 재구성(reorg)이 일어나는 전형적 시나리오를 자동으로 시연.
async function netScenario() {
  if (!netEngine || netBusy) return;
  netBusy = true;
  const btn = $("netScenarioBtn");
  const reset = $("netResetBtn");
  btn.disabled = true;
  reset.disabled = true;

  // 깨끗한 시작: 3노드로 초기화
  $("netNodeCount").value = 3;
  netBuild();

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const steps = [
    () => netEngine.mine_on(0), // A가 #1 채굴
    () => netEngine.broadcast(0), // A가 방송 → B·C 동기화
    () => netEngine.mine_on(1), // B가 #2 채굴 (자기만 앎)
    () => netEngine.mine_on(0), // A도 #2 채굴 → 포크! (A#2 vs B#2)
    () => netEngine.broadcast(1), // B가 방송 → A는 동률이라 유지, C는 B를 따라감
    () => netEngine.mine_on(0), // A가 #3 채굴 → A가 더 길어짐
    () => netEngine.broadcast(0), // A가 방송 → B·C가 A로 재구성(reorg), B의 블록 버려짐
  ];

  for (const step of steps) {
    await sleep(1100);
    netApply(step());
  }

  btn.disabled = false;
  reset.disabled = false;
  netBusy = false;
}

// ============================================================
// 7번 탭: 이중지불 공격 — 공개 체인 vs 공격자 비밀 체인
// ============================================================
let dsEngine = null;
let dsState = null;
let dsBusy = false;

const clampNum = (v, min, max, def) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : def;
};

function setupDoubleSpend() {
  $("dsResetBtn").addEventListener("click", () => {
    if (dsBusy) return;
    dsBuild();
  });
  $("dsScenarioBtn").addEventListener("click", dsScenario);

  const act = (fn) => () => {
    if (!dsEngine || dsBusy) return;
    dsApply(fn());
  };
  $("dsPayBtn").addEventListener("click", act(() => dsEngine.start_payment()));
  $("dsHonestBtn").addEventListener("click", act(() => dsEngine.honest_mine()));
  $("dsAttackBtn").addEventListener("click", act(() => dsEngine.attacker_mine()));
  $("dsRevealBtn").addEventListener("click", act(() => dsEngine.reveal()));

  dsBuild();
  setupDsCalc();
}

// ---- 51% 공격 성공 확률 계산기 ----
function setupDsCalc() {
  const hash = $("dsHash");
  const z = $("dsCalcZ");
  const trials = $("dsTrials");
  const render = () => renderDsCalc();
  hash.addEventListener("input", () => {
    $("dsHashVal").textContent = `${hash.value}%`;
    render();
  });
  z.addEventListener("input", render);
  trials.addEventListener("change", render);
  $("dsHashVal").textContent = `${hash.value}%`;
  renderDsCalc();
}

// 확률(0~1) → 사람이 읽는 퍼센트 문자열
function fmtPct(pFrac) {
  const pct = pFrac * 100;
  if (pct >= 10) return pct.toFixed(1) + "%";
  if (pct >= 1) return pct.toFixed(2) + "%";
  if (pct >= 0.001) return pct.toFixed(4) + "%";
  if (pct <= 0) return "0%";
  return pct.toExponential(2) + "%";
}

function renderDsCalc() {
  const q = clampNum($("dsHash").value, 1, 99, 30);
  const z = clampNum($("dsCalcZ").value, 1, 50, 6);
  const trials = Number($("dsTrials").value) || 10000;

  const theo = dbl_spend_probability(q, z);
  const exp = dbl_spend_simulate(q, z, trials);

  $("dsCalcOut").innerHTML = `
    <div class="ds-stat">
      <span class="ds-stat-k">${t("js.calcTheo")}</span>
      <span class="ds-stat-v ${theo > 0.01 ? "bad" : "good"}">${fmtPct(theo)}</span>
    </div>
    <div class="ds-stat">
      <span class="ds-stat-k">${t("js.calcExp", { n: fmtInt(trials) })}</span>
      <span class="ds-stat-v ${exp > 0.01 ? "bad" : "good"}">${fmtPct(exp)}</span>
    </div>
    <div class="ds-stat">
      <span class="ds-stat-k">${t("js.calcRatio")}</span>
      <span class="ds-stat-v">${q}% : ${100 - q}%</span>
    </div>`;

  // 해석 배너
  let verdict;
  if (q >= 50) {
    verdict = `<div class="ds-verdict warn">${t("js.calcMajority", { q })}</div>`;
  } else if (theo < 0.0001) {
    verdict = `<div class="ds-verdict good">${t("js.calcTiny", { q, z, p: fmtPct(theo) })}</div>`;
  } else {
    verdict = `<div class="ds-verdict warn">${t("js.calcSome", { q, z, p: fmtPct(theo) })}</div>`;
  }
  $("dsCalcVerdict").innerHTML = verdict;

  // 깊이(컨펌)별 감소 막대그래프 — 지수 감소를 눈으로
  const depths = [1, 2, 3, 4, 6, 10, 20];
  const rows = depths
    .map((d) => {
      const pr = dbl_spend_probability(q, d);
      const pct = pr * 100;
      const w = Math.max(pr <= 0 ? 0 : 1.5, pct); // 최소 폭으로 존재감 유지
      return `<div class="ds-decay-row">
        <span class="ds-decay-z">${t("js.confN", { n: d })}</span>
        <span class="ds-decay-bar"><span class="ds-decay-fill ${
          pr > 0.01 ? "hi" : "lo"
        }" style="width:${Math.min(100, w)}%"></span></span>
        <span class="ds-decay-val">${fmtPct(pr)}</span>
      </div>`;
    })
    .join("");
  $("dsDecay").innerHTML = rows;
}

function dsBuild() {
  const diff = clampNum($("dsDifficulty").value, 1, 5, 3);
  const conf = clampNum($("dsConf").value, 1, 20, 1);
  dsEngine = new WasmDoubleSpend(diff, conf);
  clearEngineLog("dsLog");
  dsApply(dsEngine.snapshot());
}

function dsApply(json) {
  dsState = JSON.parse(json);
  renderDs();
  pullDsLogs();
}

const dsName = (n) =>
  ({ Attacker: t("js.dsAttacker"), Merchant: t("js.dsMerchant"), Honest: t("js.dsHonest") }[n] || n);

function dsBlockHTML(b, shared, lane) {
  const label = b.isGenesis ? t("js.genesisTag") : `#${b.id}`;
  const txsHtml = b.txs
    .map((tx) => {
      if (tx.isCoinbase)
        return `<span class="ds-tx ds-tx-cb">${t("js.dsCoinbase", {
          who: esc(dsName(tx.to)),
          amt: fmtBtc(tx.amount),
        })}</span>`;
      const isPay = tx.from === "Attacker" && tx.to === "Merchant";
      const isFraud = tx.from === "Attacker" && tx.to === "Attacker";
      const cls = isPay ? "ds-tx-pay" : isFraud ? "ds-tx-fraud" : "ds-tx-normal";
      const tag = isPay ? t("js.dsPayTag") : isFraud ? t("js.dsFraudTag") : "";
      return `<span class="ds-tx ${cls}">${tag ? `<b>${tag}</b> ` : ""}${esc(dsName(tx.from))}→${esc(
        dsName(tx.to)
      )} ${fmtBtc(tx.amount)}</span>`;
    })
    .join("");
  let cls = b.isGenesis ? "nb-genesis" : shared ? "nb-agreed" : lane === "pub" ? "ds-pub" : "ds-atk";
  return `<div class="net-block ds-block ${cls}" title="hash: ${esc(b.hash)}&#10;nonce: ${b.nonce}">
    <span class="nb-id">${label}</span>
    <div class="ds-txs">${txsHtml}</div>
  </div>`;
}

function renderDs() {
  if (!dsState) return;
  const s = dsState;
  const fork = s.forkLen;

  $("dsPublicChain").innerHTML = s.publicChain
    .map((b, i) => dsBlockHTML(b, i < fork, "pub"))
    .join('<span class="net-link">→</span>');

  const atkWrap = $("dsAttackerChain");
  if (!s.started) {
    atkWrap.innerHTML = `<div class="ds-empty">${t("js.dsNotStarted")}</div>`;
  } else {
    atkWrap.innerHTML = s.attackerChain
      .map((b, i) => dsBlockHTML(b, i < fork, "atk"))
      .join('<span class="net-link">→</span>');
  }

  $("dsAttackerSub").textContent = s.revealed
    ? s.attackWon
      ? t("js.dsRevealedWon")
      : t("js.dsRevealedLost")
    : t("ds.attackerLaneSub");
  $("dsAttackerLane").classList.toggle("revealed", s.revealed && s.attackWon);

  renderDsStatus(s);

  const lock = s.revealed;
  $("dsPayBtn").disabled = s.started || lock;
  $("dsHonestBtn").disabled = !s.started || lock;
  $("dsAttackBtn").disabled = !s.started || lock;
  $("dsRevealBtn").disabled = !s.started || lock;
}

function renderDsStatus(s) {
  const pubLen = s.publicChain.length - 1;
  const atkLen = s.started ? s.attackerChain.length - 1 : 0;
  const shipped = s.shipped;

  let verdict = "";
  if (s.revealed) {
    if (s.attackWon) {
      verdict = shipped
        ? `<div class="ds-verdict bad">${t("js.dsWonShipped")}</div>`
        : `<div class="ds-verdict warn">${t("js.dsWonNotShipped")}</div>`;
    } else {
      verdict = `<div class="ds-verdict good">${t("js.dsLost")}</div>`;
    }
  }

  const raceTag = s.started && atkLen > pubLen ? ` <span class="ds-race">${t("js.dsRace")}</span>` : "";
  $("dsStatus").innerHTML = `
    <div class="ds-stat">
      <span class="ds-stat-k">${t("js.dsStatCoins")}</span>
      <span class="ds-stat-v ${s.merchantBalance > 0 ? "good" : "bad"}">${fmtBtc(s.merchantBalance)} BTC</span>
    </div>
    <div class="ds-stat">
      <span class="ds-stat-k">${t("js.dsStatConf")}</span>
      <span class="ds-stat-v">${s.started ? s.confirmations : 0} / ${s.requiredConf}</span>
    </div>
    <div class="ds-stat">
      <span class="ds-stat-k">${t("js.dsStatShip")}</span>
      <span class="ds-stat-v ${shipped ? "bad" : ""}">${shipped ? t("js.dsShipped") : t("js.dsWaiting")}</span>
    </div>
    <div class="ds-stat">
      <span class="ds-stat-k">${t("js.dsStatLen")}</span>
      <span class="ds-stat-v">${pubLen} vs ${atkLen}${raceTag}</span>
    </div>
    ${verdict}`;
}

function pullDsLogs() {
  if (!dsEngine) return;
  let logs;
  try {
    logs = JSON.parse(dsEngine.take_logs());
  } catch {
    return;
  }
  appendEngineLogs("dsLog", logs, dsLogClass);
}

function dsLogClass(line) {
  let cls = "";
  if (line.includes("공격 성공") || line.includes("재구성")) cls = "lg-reorg";
  else if (line.includes("공격 실패")) cls = "lg-good";
  else if (line.includes("공격자")) cls = "lg-fork";
  else if (line.includes("판매자") || line.includes("결제")) cls = "lg-cast";
  else if (line.includes("무시") || line.includes("안내")) cls = "lg-bad";
  return "net-log-line " + cls;
}

// 공격이 성공하는 전형적 흐름을 자동으로 재생.
async function dsScenario() {
  if (!dsEngine || dsBusy) return;
  dsBusy = true;
  const btn = $("dsScenarioBtn");
  const reset = $("dsResetBtn");
  btn.disabled = true;
  reset.disabled = true;

  // 극적인 성공을 위해 컨펌 1개로 초기화(상점이 성급하게 배송).
  $("dsConf").value = 1;
  dsBuild();

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const steps = [
    () => dsEngine.start_payment(), // 결제 공개 체인에 담김 → 컨펌1 → 상점 배송 📦
    () => dsEngine.honest_mine(), // 정직한 네트워크가 한 칸 더
    () => dsEngine.attacker_mine(), // 공격자 비밀 채굴(이중지불 tx)
    () => dsEngine.attacker_mine(), // 공격자 추격
    () => dsEngine.attacker_mine(), // 공격자가 더 길어짐
    () => dsEngine.reveal(), // 공개 → reorg → 결제 증발 → 공격 성공
  ];
  for (const step of steps) {
    await sleep(1200);
    dsApply(step());
  }

  btn.disabled = false;
  reset.disabled = false;
  dsBusy = false;
}
