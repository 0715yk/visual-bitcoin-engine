// ============================================================
// app.js — 화면 로직 (Rust 엔진을 호출해서 그리기만 한다)
// ============================================================
// 무거운 계산(SHA-256, 채굴, 잔액/체인 검증)은 전부 WASM(Rust)이 한다.
// 이 파일은 그 결과(JSON)를 받아 DOM으로 그리는 일만 담당한다.

import init, {
  WasmEngine,
  WasmUtxo,
  WasmHeaderMiner,
  sha256,
  pow_try,
  pow_preimage,
  merkle_tree,
  dsha256_steps,
} from "./pkg/visual_bitcoin_engine.js";

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
const fmtInt = (x) => Number(x).toLocaleString("en-US");

// 해시 앞쪽의 연속된 0을 강조 표시
function hlLeadingZeros(hash) {
  const m = String(hash).match(/^0+/);
  const z = m ? m[0].length : 0;
  return `<span class="lead0">${hash.slice(0, z)}</span>${esc(hash.slice(z))}`;
}

// 거래 한 건을 Rust의 to_hash_string()과 똑같이 문자열로 (해시 재계산용)
const txToHashString = (tx) => `${tx.from}->${tx.to}:${rustNum(tx.amount)}`;

// ============================================================
// 탭 전환
// ============================================================
$("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab-btn");
  if (!btn) return;
  const tab = btn.dataset.tab;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
  document.querySelectorAll(".tab-panel").forEach((p) =>
    p.classList.toggle("active", p.id === `tab-${tab}`)
  );
});

// WASM과 무관하게 바로 켜두는 UI(툴팁 · 곡선 시각화). 엔진 로딩 실패해도 떠야 한다.
setupTooltips();
setupCurveViz();

// ============================================================
// 메인: WASM 초기화 후 모든 기능 연결
// ============================================================
init()
  .then(() => {
    $("engineBadge").classList.add("ready");
    $("engineStatus").textContent = "Rust 엔진(WASM) 실행 중";
    setupSha();
    setupMiningLab();
    setupChainSim();
    setupUtxo();
    setupAnatomy();
  })
  .catch((err) => {
    $("engineBadge").classList.add("error");
    $("engineStatus").textContent = "엔진 로딩 실패 (콘솔 확인)";
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
    h.setAttribute("aria-label", "도움말");
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
      rd.innerHTML = `점프 횟수(개인키 d) = <b>${d}</b> · 착지점(공개키 Q) = <b>${d}G</b> ≈ (${Q.x.toFixed(
        2
      )}, ${Q.y.toFixed(2)})`;
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
    $("avDelta").textContent = a === b ? "동일한 입력" : `${charDiff}글자`;
  };
  avA.addEventListener("input", renderAv);
  avB.addEventListener("input", renderAv);
  renderAv();

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
          ? `<div class="mc-link" title="이 블록의 '이전 해시' = 바로 앞 블록의 '이 블록 해시'"></div>`
          : "";
      return `${link}
      <div class="mc-block ${i === 0 ? "genesis" : ""}">
        <div class="mc-head">
          <span class="id">블록 #${i + 1}</span>
          ${i === 0 ? '<span class="tag">제네시스(첫 블록)</span>' : ""}
        </div>
        <div class="mc-row">
          <span class="k">데이터</span>
          <input id="mcData${i}" value="${esc(b.data)}" />
        </div>
        <div class="mc-row">
          <span class="k">nonce</span>
          <div class="mc-nonce">
            <input id="mcNonce${i}" type="number" value="0" />
            <button class="btn sm" data-mine="${i}">⛏ 채굴 (해시 앞을 0으로)</button>
          </div>
        </div>
        <div class="mc-row">
          <span class="k">이전 해시</span>
          <span class="mc-hash prev" id="mcPrev${i}"></span>
        </div>
        <div class="mc-row">
          <span class="k">이 블록 해시</span>
          <span class="mc-hash self" id="mcHash${i}"></span>
        </div>
      </div>`;
    })
    .join("");

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
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "⛏ 채굴 중…";

    let n = 0;
    const step = () => {
      const h = sha256(prev + data + String(n));
      nonceEl.value = n;
      hashEl.innerHTML = hlLeadingZeros(h); // 실패 중엔 앞에 0이 없어 강조도 안 됨
      if (h.startsWith("0")) {
        mining.delete(i);
        btn.disabled = false;
        btn.textContent = label;
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

  // 시도 한 줄을 노가다 로그에 추가
  function logAttempt(n, hash, ok) {
    const short = hash.slice(0, 24);
    const m = short.match(/^0+/);
    const z = m ? m[0].length : 0;
    const hl = `<span class="lead0">${short.slice(0, z)}</span>${esc(short.slice(z))}`;
    const div = document.createElement("div");
    div.className = "line " + (ok ? "win" : "fail");
    div.innerHTML = ok
      ? `✅ nonce=${fmtInt(n)} → <span class="h">${hl}…</span>  목표 달성! 0이 충분함`
      : `❌ nonce=${fmtInt(n)} → <span class="h">${hl}…</span>`;
    logEl.appendChild(div);
    // 너무 길어지지 않게 최근 200줄만 유지
    while (logEl.childElementCount > 200) logEl.removeChild(logEl.firstChild);
    logEl.scrollTop = logEl.scrollHeight;
  }
  function logNote(text) {
    const div = document.createElement("div");
    div.className = "line skip";
    div.textContent = text;
    logEl.appendChild(div);
    logEl.scrollTop = logEl.scrollHeight;
  }

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
    $("powPreimage").textContent = "—";
    $("powNonce").textContent = "0";
    $("powAttempts").textContent = "0";
    $("powRate").textContent = "0";
    $("powElapsed").textContent = "0.0s";
    logEl.innerHTML = `<div class="line init">⛏ 채굴을 시작하면 시도 과정이 여기 한 줄씩 찍힙니다.</div>`;
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
  function updateStage(data, shownNonce, hash, found) {
    const elapsed = (performance.now() - startTime) / 1000;
    $("powNonce").textContent = fmtInt(shownNonce);
    $("powAttempts").textContent = fmtInt(attempts);
    $("powRate").textContent = fmtInt(Math.round(attempts / Math.max(elapsed, 0.001)));
    $("powElapsed").textContent = elapsed.toFixed(1) + "s";
    $("powHash").innerHTML = hlLeadingZeros(hash);
    $("powPreimage").textContent = pow_preimage(data, BigInt(shownNonce));
    return elapsed;
  }

  function finish(data, difficulty, winNonce, hash) {
    attempts = winNonce + 1;
    const elapsed = updateStage(data, winNonce, hash, true);
    $("powHash").classList.add("found");
    logAttempt(winNonce, hash, true);
    logNote(`총 ${fmtInt(attempts)}번 해시를 계산해서야 0이 ${difficulty}개인 해시를 찾았어요. (소요 ${elapsed.toFixed(2)}초)`);
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
    logEl.innerHTML = "";

    const data = dataEl.value;
    const difficulty = Number(diffEl.value);
    logNote(`목표: SHA-256("${data}" + nonce) 의 앞자리가 "${"0".repeat(difficulty)}" 이 될 때까지 nonce를 0,1,2,… 늘려본다.`);

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
        logNote("… 이런 식으로 계속 실패합니다. 너무 많아서 이제부터는 빠르게 진행하며 표본만 보여줄게요 …");
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
  function addPowHistory(d, att, sec) {
    history.unshift({ d, att, sec });
    $("powHistory").innerHTML =
      "<hr class='sep'><b>채굴 기록</b> (난이도가 1 오를 때마다 시도 횟수가 어떻게 폭증하는지 보세요)<br>" +
      history
        .slice(0, 8)
        .map(
          (h) =>
            `난이도 <b class="mono">${h.d}</b> → ${fmtInt(h.att)}회 시도, ${h.sec.toFixed(2)}초`
        )
        .join("<br>");
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
      flashTxMsg("주소와 0보다 큰 금액을 입력하세요.", false);
      return;
    }
    const ok = engine.add_transaction(from, to, amount);
    flashTxMsg(
      ok ? `승인: ${from} → ${to} (${fmtBtc(amount)} BTC) 멤풀 대기` : `거부됨: ${from} 잔액이 부족합니다.`,
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
  $("console").innerHTML = "";
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
    box.innerHTML = `<div class="empty">아직 잔액이 없습니다. 블록을 채굴해 보세요.</div>`;
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
    box.innerHTML = `<div class="empty">아직 대기 중인 거래가 없습니다.</div>`;
    return;
  }
  box.innerHTML = pending.map((tx) => txRow(tx)).join("");
}

function txRow(tx, opts = {}) {
  const coinbase = tx.from === "COINBASE";
  const cls = `tx ${coinbase ? "coinbase" : ""} ${opts.tampered ? "tampered" : ""}`;
  const tamperBtns =
    opts.tamperKey != null
      ? `<button class="btn danger sm" data-tamper="${opts.tamperKey}" title="데이터만 바꾸고 해시는 그대로 → 검증 ①(해시 불일치)에서 걸림">조작</button>
    <button class="btn danger sm" data-tamper-rehash="${opts.tamperKey}" title="바꾼 뒤 해시는 다시 계산(채굴은 생략) → 검증 ③(작업증명)에서 걸림">조작+재해시</button>`
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
        : `<div class="empty">거래 없음 (제네시스 블록)</div>`;

      const link =
        i > 0
          ? `<div class="link-down" title="이 블록의 prev_hash = 이전 블록의 hash"></div>`
          : "";

      return `${link}
      <div class="block-wrap">
        <div class="block ${isGenesis ? "genesis" : ""} ${bad ? "tampered" : ""}">
          <div class="block-head">
            <span class="id">Block #${block.id}</span>
            ${isGenesis ? '<span class="tag">제네시스</span>' : ""}
            <span class="tag nonce">nonce ${fmtInt(block.nonce)}</span>
            <span class="tag time">${new Date(block.timestamp * 1000).toLocaleTimeString("ko-KR")}</span>
            ${tampered ? '<span class="tag" style="color:var(--red)">⚠ 위변조 감지 (해시 불일치)</span>' : ""}
            ${powBad ? '<span class="tag" style="color:var(--red)">⚠ 작업증명 불충족 (채굴 안 됨)</span>' : ""}
          </div>
          <div class="block-field">
            <span class="lbl">이 블록 해시</span>
            <span class="hash-pill self ${powBad ? "bad" : ""}">${hlLeadingZeros(block.hash)}</span>
          </div>
          ${
            tampered
              ? `<div class="block-field">
                  <span class="lbl" style="color:var(--red)">다시 계산</span>
                  <span class="hash-pill bad">${esc(recomputed)}</span>
                </div>`
              : ""
          }
          ${
            powBad
              ? `<div class="block-field">
                  <span class="lbl" style="color:var(--red)">필요 조건</span>
                  <span class="hash-pill bad">${esc(target)}… 로 시작해야 함 (0 ${block.difficulty}개)</span>
                </div>`
              : ""
          }
          <div class="block-field">
            <span class="lbl">이전 해시</span>
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
    box.innerHTML = `<span class="icon">✅</span><div><b>체인 정상</b><br><span class="small">${esc(r.reason)}</span></div>`;
  } else {
    box.className = "verdict bad";
    box.innerHTML = `<span class="icon">🚫</span><div><b>위변조/오류 감지!</b><br><span class="small">${esc(r.reason)}</span></div>`;
  }
}

// ---------- 위변조 ----------
// rehash=false: 데이터만 바꾸고 해시는 그대로 → 검증 ①(해시 불일치)에서 걸림
// rehash=true : 바꾼 뒤 해시도 다시 계산(채굴은 생략) → 검증 ③(작업증명)에서 걸림
function doTamper(blockIndex, txIndex, rehash = false) {
  const s = snap();
  const tx = s.chain[blockIndex].transactions[txIndex];
  const newTo = prompt(`받는 사람을 바꿉니다.\n현재: ${tx.to}`, tx.to);
  if (newTo === null) return;
  const newAmountStr = prompt(`금액을 바꿉니다.\n현재: ${tx.amount} BTC`, tx.amount);
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
  flashTxMsg(
    rehash
      ? "조작 후 해시를 다시 계산했어요(채굴은 생략). 해시는 내용과 맞지만 0으로 시작하지 않죠 → '체인 검증'을 눌러 작업증명(③)에서 걸리는지 보세요."
      : "블록을 조작했습니다(해시는 그대로). '체인 검증'을 눌러 해시 불일치(①)로 탐지되는지 보세요.",
    false
  );
}

// ---------- 로그 콘솔 ----------
function pullLogs() {
  const logs = JSON.parse(engine.take_logs());
  const box = $("console");
  for (const line of logs) {
    let cls = "";
    if (line.includes("[TX]")) cls = "tx";
    else if (line.includes("[REJECTED]")) cls = "reject";
    else if (line.includes("[MINING]") || line.includes("[MINED]")) cls = "mine";
    else if (line.includes("난이도")) cls = "diff";
    else if (line.includes("[INIT]")) cls = "init";
    const div = document.createElement("div");
    div.className = `line ${cls}`;
    div.textContent = line;
    box.appendChild(div);
  }
  box.scrollTop = box.scrollHeight;
}

function flashTxMsg(msg, ok) {
  const el = $("txMsg");
  el.textContent = msg;
  el.style.color = ok ? "var(--green)" : "var(--red)";
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
    const box = btn.closest(".sig-box");
    if (!box) return;
    const calc = sha256(btn.dataset.msg || ""); // WASM의 SHA-256 (엔진과 동일한 함수)
    const match = calc === (btn.dataset.sighash || "");
    box.querySelector(".sig-hash-calc").textContent = calc;
    box.querySelector(".sig-hash-cmp").innerHTML = match
      ? `<span class="cmp ok">✅ 계산값 == 엔진의 sighash — 똑같죠? sighash는 "원문을 SHA-256으로 요약한 값"일 뿐이고, 누구나 이렇게 재현·검증할 수 있어요.</span>`
      : `<span class="cmp bad">❌ 값이 다릅니다. (원문이 바뀌었거나 계산 대상이 다름)</span>`;
  });
  $("uReset").addEventListener("click", () => {
    utxo.free?.();
    utxo = new WasmUtxo();
    $("uConsole").innerHTML = "";
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
  return `<div class="${cls}" data-key="${esc(u.key)}">
    <span class="amt">${fmtBtc(u.amount)}<small> BTC</small></span>
    <span class="id">${esc(String(u.txid).slice(0, 6))}…:${u.vout}</span>
    ${role}
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
    box.innerHTML = `<div class="empty">아직 UTXO가 없습니다. ①에서 코인을 발행해 보세요.</div>`;
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
          <span class="who-addr" title="${esc(addr)}">${esc(shortAddr(addr))}</span>
          <span class="sum">잔액 ${fmtBtc(total)} BTC · 동전 ${coins.length}개</span>
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
    box.innerHTML = `<div class="empty">아직 지갑이 없습니다. 아래 ①에서 코인을 발행하면 키쌍이 생겨요.</div>`;
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
          <div class="w-row"><span class="w-tag">주소</span><span class="w-addr">${esc(w.address)}</span></div>
          <div class="w-row"><span class="w-tag">공개키</span><span class="w-pub">${esc(w.pubkey)}</span></div>
          <div class="w-row"><span class="w-tag">잔액</span><span class="w-bal">${fmtBtc(bal)} BTC</span></div>
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
    msg.style.color = "var(--red)";
    msg.textContent = "주소와 0보다 큰 금액을 입력하세요.";
    return;
  }

  const r = JSON.parse(utxo.send(from, to, amount, fee));
  if (!r.ok) {
    msg.style.color = "var(--red)";
    msg.textContent = "거부됨: " + r.error;
    pullUtxoLogs();
    return;
  }
  msg.style.color = "var(--green)";
  msg.textContent = `송금 성공! 입력 ${r.spent.length}개 소비 → 출력 ${r.created.length}개 생성`;

  // 1) 거래 다이어그램 표시
  renderUtxoFlow(r, from, to);

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
    .map((u) => coinChip(u, { spent: true, roleText: from + " 소유" }))
    .join("");
  const inSum = r.spent.reduce((a, c) => a + c.amount, 0);
  $("uFlowInSum").innerHTML = `합계 <b>${fmtBtc(inSum)}</b> BTC`;

  $("uFlowOutputs").innerHTML = r.created
    .map((u) =>
      coinChip(u, {
        change: u.change,
        recipient: !u.change,
        flash: true,
        roleText: u.change ? `거스름돈 → ${from}` : `→ ${to}`,
      })
    )
    .join("");
  const outSum = r.created.reduce((a, c) => a + c.amount, 0);
  $("uFlowOutSum").innerHTML = `합계 <b>${fmtBtc(outSum)}</b> BTC`;

  $("uFlowEq").innerHTML =
    `입력 <b>${fmtBtc(inSum)}</b>  =  출력 <b>${fmtBtc(outSum)}</b>  +  ` +
    `수수료 <span class="fee">${fmtBtc(r.fee)}</span>  ` +
    `<span class="muted">(수수료는 채굴자 ⛏ 몫)</span>`;

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
      return `<div class="leg-in">입력 · 소비할 출처(UTXO) <span class="mono">${esc(
        (txid || "").slice(0, 14)
      )}…:${esc(vout || "")}</span></div>`;
    }
    if (p.startsWith("out:")) {
      const [, addr, amt] = p.split(":");
      const isChange = signerAddress && addr === signerAddress;
      const role = isChange ? "거스름돈 →" : "받는 사람 →";
      return `<div class="leg-out">출력 · ${role} <span class="mono">${addrLabelHtml(
        addr || ""
      )}</span> ← <b>${esc(amt || "")}</b> BTC</div>`;
    }
    return `<div>${esc(p)}</div>`;
  });
  return items.join("");
}

// 1·2·3 서명/검증 블록 전체 HTML을 만들어 반환 (송금·도둑질 공용)
function sigBlockHTML(r) {
  const msg = r.message || "";
  const sig = r.signature || "";
  const rHex = sig.slice(0, 64);
  const sHex = sig.slice(64);
  const derived = r.signerAddress || "";
  const lock = r.lockAddress || "";
  const aOk = derived === lock; // (a) 주인 확인: 유도 주소 == 잠긴 주소?

  // (a) 행: 통과/실패에 따라 색과 마크
  const aRow = aOk
    ? `<div><b>(a) 주인 확인</b> ✅ — 공개키를 해시한 주소 <span class="mono">${addrLabelHtml(
        derived
      )}</span> <b>==</b> 동전이 잠긴 주소 <span class="mono">${addrLabelHtml(
        lock
      )}</span> <span class="muted">(이 공개키가 진짜 그 동전 임자 것)</span></div>`
    : `<div class="vfail"><b>(a) 주인 확인</b> ❌ — 서명한 키의 주소 <span class="mono">${addrLabelHtml(
        derived
      )}</span> <b>≠</b> 동전이 잠긴 주소 <span class="mono">${addrLabelHtml(
        lock
      )}</span> <span class="muted">→ 남의 동전! 여기서 거부됩니다.</span></div>`;

  // (b) 행: (a)가 통과했을 때만 실제로 확인됨. 도둑질은 (a)에서 이미 탈락.
  const bRow = aOk
    ? `<div><b>(b) 동의 확인</b> ✅ — 서명 <b>(r,s)</b>·sighash <b>z</b>·공개키 <b>Q</b>로 곡선 점 <span class="mono">R′ = z·s⁻¹·G + r·s⁻¹·Q</span> → <b>R′.x == r</b> 성립. <span class="muted">(그 임자가 정확히 이 거래에 동의)</span></div>`
    : `<div class="vskip"><b>(b) 동의 확인</b> — <span class="muted">(a)에서 이미 탈락해 확인까지 안 감. 참고로 이 서명 자체는 <b>공격자 키로는 수학적으로 유효</b>하지만, 그 키는 이 동전 주인이 아니라 소용없어요.</span></div>`;

  const verdict = r.verified
    ? `<div class="sig-verdict ok">✅ 검증 통과 — (a) 공개키가 UTXO 주소와 일치하고, (b) 서명도 유효합니다. 거래가 적용되었습니다.</div>`
    : `<div class="sig-verdict bad">🚫 검증 실패 — ${esc(
        r.error || "서명이 유효하지 않습니다."
      )} 거래가 거부되어 동전은 그대로 안전합니다. 🔒</div>`;

  return `
    <div class="sig-title">🔏 디지털 서명 &amp; 검증 <span class="pill-tag">secp256k1 ECDSA</span></div>
    <div class="sig-steps">
      <div class="sig-step">
        <div class="sig-step-no">1</div>
        <div class="sig-step-body">
          <div class="sig-step-h">서명 대상 원문 → SHA-256 → sighash</div>
          <div class="muted small" style="margin-bottom:6px">거래 내용을 정해진 형식으로 <b>직렬화</b>(각 입력의 출처 + 각 출력의 주소·금액)한 <b>원문</b>을 SHA-256으로 요약한 게 sighash고, 개인키는 이 sighash에 서명해요.</div>
          <div class="sig-sub-label">① 서명 대상 원문 (직렬화된 거래 내용)</div>
          <div class="mono small sig-msg">${esc(msg)}</div>
          <div class="sig-msg-legend">${sigMsgLegend(msg, derived)}</div>
          <button class="btn ghost sm sig-hash-btn" data-msg="${esc(msg)}" data-sighash="${esc(
    r.sighash
  )}" style="margin-top:8px">🔁 이 원문을 SHA-256으로 직접 돌려보기</button>
          <div class="sig-sub-label" style="margin-top:8px">② 내 브라우저에서 계산한 SHA-256</div>
          <div class="mono small sig-hash-calc"><span class="muted">위 버튼을 누르면 여기서 직접 계산해요.</span></div>
          <div class="sig-sub-label" style="margin-top:8px">③ 엔진이 실제 서명에 쓴 sighash</div>
          <div class="mono small">${esc(r.sighash)}</div>
          <div class="sig-hash-cmp"></div>
        </div>
      </div>
      <div class="sig-step">
        <div class="sig-step-no">2</div>
        <div class="sig-step-body">
          <div class="sig-step-h">개인키로 sighash에 서명 — ${esc(r.signerLabel)}</div>
          <div class="muted small" style="margin-bottom:6px">ECDSA-secp256k1가 <b>재료 2개</b>(개인키 + sighash)를 받아 서명 1개를 만들어요. 개인키는 비밀이라 <b>화면에 안 나옵니다</b>. 결과 서명은 64바이트 = <b>r</b>(앞 32) ‖ <b>s</b>(뒤 32).</div>
          <div class="sig-io">
            <div class="sig-io-in">
              <div>🔒 <b>${esc(r.signerLabel)}</b> 의 개인키 <span class="muted">(비밀 · 미표시)</span></div>
              <div class="sig-io-plus">＋</div>
              <div>sighash <span class="mono">${esc(r.sighash.slice(0, 16))}…</span></div>
            </div>
            <div class="sig-io-op">ECDSA<br/>secp256k1 ⚙️</div>
            <div class="sig-io-out">
              <div class="sig-sub-label">서명 r <span class="muted">(앞 32바이트)</span></div>
              <div class="mono small">${esc(rHex)}</div>
              <div class="sig-sub-label" style="margin-top:6px">서명 s <span class="muted">(뒤 32바이트)</span></div>
              <div class="mono small">${esc(sHex)}</div>
            </div>
          </div>
          <div class="muted small" style="margin-top:6px">이 데모(및 현대 비트코인)는 <b>RFC 6979 결정론적</b> 서명이라 같은 (개인키·sighash)면 항상 같은 서명. 개인키 없이는 못 만들지만, 공개키로는 누구나 검증할 수 있어요(3단계).</div>
        </div>
      </div>
      <div class="sig-step">
        <div class="sig-step-no">3</div>
        <div class="sig-step-body">
          <div class="sig-step-h">공개키로 검증 <span class="muted">(개인키 없이, 누구나)</span></div>
          <div class="sig-sub-label">서명자 공개키 — 곡선 위의 점, <b>Q = 개인키 d × G</b> (33바이트 압축)</div>
          <div class="mono small">${esc(r.pubkey)}</div>
          <div class="muted small" style="margin:3px 0 6px">앞 <b>02/03</b> = 점의 y가 짝/홀, 뒤 64자리 = x좌표. <b>d→Q</b>는 쉽지만 <b>Q→d</b>(개인키 역산)는 불가능.</div>
          <div class="sig-verify-rows">
            ${aRow}
            ${bRow}
          </div>
          <details class="aside" style="margin-top:8px">
            <summary>🔍 (b) 이 식이 왜 "위조 불가 증명"이 되나요?</summary>
            <div class="aside-body">
              <p>서명자는 개인키 <b>d</b>와 무작위 <b>k</b>로 서명을 만들어요:</p>
              <p class="mono small">r = (k·G).x  ·  s = k⁻¹·(z + r·d)  mod n</p>
              <p>검증자는 <b>개인키 없이</b> 공개값만으로 <b>R′ = u₁·G + u₂·Q</b> (u₁=z·s⁻¹, u₂=r·s⁻¹)를 계산합니다. Q = d·G 를 대입하면 <b>R′ = k·G</b> 로 되돌아오고, 그때만 <b>R′.x == r</b>.</p>
              <ul class="tight">
                <li>등식이 맞으려면 <b>Q를 만든 그 d</b>로 <b>바로 이 z</b>에 서명했어야만 함.</li>
                <li>거래 내용을 한 글자만 바꿔도 z가 달라져 → <b>R′.x ≠ r</b> → 거부.</li>
                <li>다른 사람이 서명하면(다른 d·Q) 안 맞아 → 거부.</li>
              </ul>
              <p>핵심: <b>개인키 d를 한 번도 드러내지 않고</b> "d를 안다 + 이 거래에 동의한다"를 증명 — 이게 secp256k1 ECDSA예요.</p>
            </div>
          </details>
        </div>
      </div>
    </div>
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
    box.innerHTML = `<div class="forge-verdict">공격자·피해자·금액을 올바르게 입력하세요.</div>`;
    return;
  }
  if (attacker === victim) {
    box.innerHTML = `<div class="forge-verdict">공격자와 피해자가 같으면 그냥 본인 거래예요. 다른 이름을 넣어보세요.</div>`;
    return;
  }

  // 공격자는 자기 앞으로(attacker → attacker) 피해자 동전을 보내려 시도
  const r = JSON.parse(utxo.forge(attacker, victim, attacker, amount));
  pullUtxoLogs();

  if (!r.sighash) {
    // 검증 이전 단계에서 막힘 (예: 피해자 UTXO 부족)
    box.innerHTML = `<div class="forge-verdict">시도 실패: ${esc(r.error || "")}</div>`;
    renderSigInto("uForgeSig", { sighash: "" }); // 숨김
    return;
  }

  if (r.verified) {
    box.innerHTML = `<div class="forge-verdict ok">예상과 달리 통과했습니다(본인 거래로 처리됨).</div>`;
    renderUtxoPool();
    return;
  }

  box.innerHTML = `<div class="forge-verdict">
    <b>🚫 도둑질 거부됨!</b> <b>${esc(attacker)}</b> 가 <b>${esc(victim)}</b> 의 ${fmtBtc(
    amount
  )} BTC를 가로채려 했지만, ${esc(victim)} 의 <b>개인키가 없어서</b> 자기 키로 서명할 수밖에 없었어요.
    아래 <b>똑같은 1·2·3 검증 파이프라인</b>이 <b>③-(a)</b>에서 딱 걸리는 걸 보세요. 🔒
  </div>`;
  // 송금과 동일한 서명/검증 블록을 렌더 → ③(a) 주소 불일치로 실패하는 게 보임
  renderSigInto("uForgeSig", r);
  // 검증 실패라 UTXO 상태는 그대로
}

function pullUtxoLogs() {
  const logs = JSON.parse(utxo.take_logs());
  const box = $("uConsole");
  for (const line of logs) {
    let cls = "mine";
    if (line.includes("[거래]")) cls = "tx";
    else if (line.includes("[위조 거부]")) cls = "reject";
    else if (line.includes("[발행]") || line.includes("[지갑]")) cls = "init";
    const div = document.createElement("div");
    div.className = `line ${cls}`;
    div.textContent = line;
    box.appendChild(div);
  }
  box.scrollTop = box.scrollHeight;
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
    info.textContent = "거래를 한 줄에 하나씩 입력하세요.";
    $("anMerkle").innerHTML = "";
    $("anRootLine").style.display = "none";
    return;
  }
  const mk = JSON.parse(merkle_tree(JSON.stringify(txs)));
  anLastRoot = mk.root;
  renderMerkle(mk);
  info.textContent = `거래 ${mk.txCount}건 → 트리 ${mk.levels.length}층`;
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
      chips += `<div class="mk-node dup" title="홀수라서 마지막 노드를 복제\n${esc(last)}">
        <span class="mk-hash">${shortHash(last, 8)}</span>
        <span class="mk-tag">복제</span>
      </div>`;
    }

    html += `<div class="merkle-level ${isRoot ? "is-root" : ""}">${chips}</div>`;
    if (i > 0) html += `<div class="merkle-connector">▲ 둘씩 이어붙여 double SHA-256</div>`;
  }
  box.innerHTML = html;
}

function assembleHeader() {
  const txs = anReadTxs();
  if (!txs.length) {
    alert("먼저 ①에서 거래를 입력하세요.");
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

  // 채굴 패널 초기화
  $("anDStep0").textContent = "—";
  $("anDStep1").textContent = "—";
  $("anDStep2").textContent = "—";
  $("anCmpHash").textContent = "—";
  $("anCmpTarget").innerHTML = hlLeadingZeros(info.targetHex);
  $("anCmpVerdict").className = "cmp-verdict";
  $("anCmpVerdict").textContent = "아직 채굴 전 — ③ 채굴 시작을 눌러보세요";
  $("anMineStat").textContent = "";
  $("anMineBtn").disabled = false;
}

function renderHeader(info) {
  const fields = [
    { name: "version", size: "4 B", val: info.version, cls: "" },
    { name: "prev_hash", size: "32 B", val: info.prevHash, cls: "" },
    { name: "merkle_root", size: "32 B", val: info.merkleRoot, cls: "accent-merkle" },
    { name: "timestamp", size: "4 B", val: `${info.timestamp} (${new Date(info.timestamp * 1000).toLocaleString()})`, cls: "" },
    { name: "bits", size: "4 B", val: `선행 0비트 ${info.zeroBits}개 요구`, cls: "" },
    { name: "nonce", size: "4 B", val: `${info.nonce}  (채굴이 바꾸는 값)`, cls: "accent-nonce" },
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
  const expStr = exp >= 1000 ? Math.round(exp).toLocaleString("en-US") : Math.round(exp).toString();
  $("anExpected").textContent = `이 target을 만족하려면 평균 약 2^${info.zeroBits} ≈ ${expStr}번 해시해야 합니다.`;
}

function startAnMine() {
  if (!anMiner || anMining) return;
  anMining = true;
  $("anMineBtn").disabled = true;
  $("anStopBtn").disabled = false;

  const loop = () => {
    if (!anMining) return;
    const r = JSON.parse(anMiner.step(40000));
    renderAnStep(r);
    if (r.found) {
      anMining = false;
      $("anStopBtn").disabled = true;
      $("anMineStat").textContent = `🎉 발견! nonce=${fmtInt(r.nonce)} · 총 ${fmtInt(r.attempts)}번 해시`;
      return;
    }
    $("anMineStat").textContent = `시도 중… nonce=${fmtInt(r.nonce)}`;
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
    v.innerHTML = `✅ 블록해시 ≤ target — 조건 만족! 이 nonce가 정답입니다.`;
  } else {
    v.className = "cmp-verdict bad";
    v.innerHTML = `블록해시 &gt; target — 아직 너무 큼. nonce를 바꿔 다시…`;
  }
}
