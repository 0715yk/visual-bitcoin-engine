// ============================================================
// eth-app.js — Visual Ethereum Engine UI (Rust WasmEth 호출)
// ============================================================

import { t, applyI18n } from "../i18n.js";
import { renderSolidity } from "./eth-solidity.js";
import { wireMerkleTab } from "./eth-merkle.js";

const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let eth = null; // WasmEth
let lastDepositId = null;
let ethKeccakFn = null;
let ethAddrFn = null;
/** @type {Record<string, number>} */
let prevBalances = {};
/** @type {Set<string>} */
let flashLabels = new Set();
let lastFlow = null;
// 탭별 상태
let scAddr = null; // 배포한 SnackMachine 주소
let scHighlight = null; // 마지막 호출 함수 (solidity 하이라이트)
/** 상태 히스토리: {ver, label, changes:[{k,from,to}], reverted, reason} */
let scHistory = [];
let tokHighlight = null;
let feedHighlight = null;
let insAddr = null;
let insHighlight = null;
let oraclePrices = { Binance: 3100, Bybit: 2900, Coinbase: 2950 };
/** @type {Record<string, number|null>} */
let prevInsBal = { Alice: null, Bob: null, pool: null };

const GAS_LIMIT = 21000;
const BASE_FEE_GWEI = 10; // 시뮬 고정 base fee (wasm_api.rs 와 동일)
const DEFAULT_TIP = 2; // 컨트랙트 호출 기본 tip (Gwei/gas)

// ---------- 공용 ----------

function pushLogs(consoleId) {
  if (!eth) return;
  const box = $(consoleId);
  if (!box) return;
  let logs = [];
  try {
    logs = JSON.parse(eth.take_logs());
  } catch {
    logs = [];
  }
  for (const line of logs) {
    const div = document.createElement("div");
    div.className = "line";
    if (/REJECTED|REVERT|SLASH|FORK|OFFLINE/.test(line)) div.classList.add("err");
    else if (/FINALIZE|JUSTIFY|ACTIVATE|TX|PROPOSE|DEPLOY|CALL/.test(line)) div.classList.add("ok");
    else if (/GENESIS|FAUCET|DEPOSIT/.test(line)) div.classList.add("init");
    div.textContent = line;
    box.appendChild(div);
  }
  box.scrollTop = box.scrollHeight;
}

function clearLogs(...ids) {
  for (const id of ids) {
    const el = $(id);
    if (el) el.innerHTML = "";
  }
}

function statusMsg(elId, text, ok) {
  const el = $(elId);
  if (!el) return;
  if (text && /<[a-z][\s\S]*>/i.test(text)) el.innerHTML = text;
  else el.textContent = text || "";
  el.style.color = ok ? "var(--green)" : "var(--red)";
}

function shortAddr(a) {
  return a && a.length > 14 ? `${a.slice(0, 8)}…${a.slice(-6)}` : a || "";
}

function currentProposer() {
  if (!eth) return "—";
  try {
    const snap = JSON.parse(eth.pos_snapshot());
    const p = snap.last_proposer;
    if (p && p !== "—") return p;
    const vals = JSON.parse(eth.validators_snapshot());
    const active = vals.find((v) => v.status === "Active");
    return active?.label || vals[0]?.label || "—";
  } catch {
    return "—";
  }
}

function contracts() {
  if (!eth) return [];
  try {
    return JSON.parse(eth.contracts_snapshot());
  } catch {
    return [];
  }
}

function allEvents() {
  if (!eth) return [];
  try {
    return JSON.parse(eth.events_snapshot());
  } catch {
    return [];
  }
}

function findContract(pred) {
  return contracts().find(pred) || null;
}

// ---------- 공용 잔액 칩 ----------

/**
 * 잔액 칩 HTML 하나를 만든다 (계정·에스크로·보험 탭 공용).
 * @param {{label:string, bal:number, roleText?:string, roleCls?:string, flash?:string,
 *          delta?:number|null, nonce?:number|null, lock?:boolean|null, dp?:number, dataLabel?:boolean}} o
 */
function chipHtml(o) {
  const dp = o.dp ?? 4;
  const deltaHtml =
    o.delta != null && Math.abs(o.delta) > 1e-12
      ? `<span class="eth-delta ${o.delta > 0 ? "up" : "down"}">${o.delta > 0 ? "+" : ""}${o.delta.toFixed(dp)}</span>`
      : "";
  const em = o.roleText ? ` <em>${o.roleText}</em>` : "";
  const tail =
    o.nonce != null
      ? `<span class="nonce">n=${o.nonce}</span>`
      : o.lock != null
        ? `<span class="nonce">${o.lock ? "🔒" : "—"}</span>`
        : "";
  return `<div class="eth-chip ${o.roleCls || ""} ${o.flash || ""}"${o.dataLabel ? ` data-label="${esc(o.label)}"` : ""}>
    <span class="who">${esc(o.label)}${em}</span>
    <span class="bal mono">${o.bal.toFixed(dp)} <small>ETH</small></span>
    ${deltaHtml}${tail}</div>`;
}

// ---------- 계정 탭 ----------

function renderAccounts() {
  if (!eth) return;
  const snap = JSON.parse(eth.accounts_snapshot());
  const list = $("ethAddrList");
  if (list) {
    list.innerHTML = snap.accounts.map((a) => `<option value="${esc(a.label)}">`).join("");
  }
  const board = $("ethLedger");
  if (!board) return;
  const prop = currentProposer();
  const order = ["Alice", "Bob", prop];
  const byLabel = Object.fromEntries(snap.accounts.map((a) => [a.label, a]));
  const shown = new Set();
  const chips = [];
  for (const label of order) {
    if (!label || label === "—" || shown.has(label)) continue;
    shown.add(label);
    chips.push(byLabel[label] || { label, address: "", balanceEth: prevBalances[label] ?? 0, nonce: 0 });
  }
  for (const a of snap.accounts) {
    if (!shown.has(a.label) && a.label !== "Faucet") chips.push(a);
  }
  board.innerHTML = chips
    .map((a) => {
      const bal = Number(a.balanceEth);
      const prev = prevBalances[a.label];
      const delta = prev != null ? bal - prev : 0;
      const role =
        a.label === prop ? "proposer" : a.label === "Alice" || a.label === "Bob" ? "party" : "";
      const flash = flashLabels.has(a.label) ? (delta > 0 ? "up" : delta < 0 ? "down" : "flash") : "";
      return chipHtml({
        label: a.label,
        bal,
        roleText: a.label === prop ? t("eth.acc.propTag") : "",
        roleCls: role,
        flash,
        delta: flashLabels.has(a.label) ? delta : null,
        nonce: a.nonce,
        dp: 6,
        dataLabel: true,
      });
    })
    .join("");
  for (const a of chips) prevBalances[a.label] = Number(a.balanceEth);
}

function renderFlow(flow) {
  const el = $("ethFlow");
  if (!el) return;
  if (!flow) {
    el.hidden = true;
    el.innerHTML = "";
    return;
  }
  lastFlow = flow;
  el.hidden = false;
  el.innerHTML = `
    <div class="eth-flow-row">
      <span class="eth-flow-chip down">${esc(flow.from)} −${flow.paid}</span>
      <span class="eth-flow-arrow" aria-hidden="true">→</span>
      <span class="eth-flow-chip up">${esc(flow.to)} +${flow.value}</span>
    </div>
    <div class="eth-flow-row">
      <span class="eth-flow-chip burn">🔥 ${t("eth.acc.burnLbl")} ${flow.burn}</span>
      <span class="eth-flow-chip tip">${esc(flow.prop)} +${flow.tip}</span>
      <span class="eth-flow-badge">nonce +1 → ${flow.nonce}</span>
    </div>`;
}

// 카드 2: 선택한 보내는 사람의 현재 nonce 라이브 표시
function renderNonceInfo() {
  const el = $("ethNonceBox");
  if (!el || !eth) return;
  const from = ($("ethFrom")?.value || "Alice").trim() || "Alice";
  let cur = 0;
  try {
    const snap = JSON.parse(eth.accounts_snapshot());
    const acc = snap.accounts.find((a) => a.label === from);
    cur = acc ? Number(acc.nonce) : 0;
  } catch {}
  el.innerHTML = t("eth.acc.nonceBox", {
    who: esc(from),
    cur: String(cur),
    next: String(cur + 1),
  });
}

function updateKeccak() {
  const input = $("ethKeccakIn")?.value ?? "";
  const hashEl = $("ethKeccakOut");
  const addrEl = $("ethAddrOut");
  const hex = ethKeccakFn ? ethKeccakFn(input) : "";
  if (hashEl) {
    if (hex.length >= 64) {
      const head = hex.slice(0, -40);
      const tail = hex.slice(-40);
      hashEl.innerHTML = `<span class="eth-hash-drop">${esc(head)}</span><span class="eth-hash-keep">${esc(tail)}</span>`;
    } else {
      hashEl.textContent = hex;
    }
  }
  if (addrEl) {
    const addr = ethAddrFn ? ethAddrFn(input) : hex.length >= 40 ? `0x${hex.slice(-40)}` : "";
    addrEl.textContent = addr;
  }
}

// 카드 1: 임의 입력 → Keccak-256 전체 해시 (눈사태 체험용)
function updateKcPlayground() {
  const el = $("ethKcPlayOut");
  if (!el) return;
  const input = $("ethKcPlayIn")?.value ?? "";
  el.textContent = ethKeccakFn ? ethKeccakFn(input) : "";
}

// 카드 3-①: 함수 셀렉터 = keccak(시그니처) 앞 4바이트
function updateSelector() {
  const el = $("ethSelOut");
  if (!el || !ethKeccakFn) return;
  const sig = ($("ethSelIn")?.value || "").trim();
  if (!sig) {
    el.textContent = "";
    return;
  }
  const hex = ethKeccakFn(sig);
  const sel = hex.slice(0, 8);
  el.innerHTML = t("eth.kc.selOut", { sig: esc(sig), hash: esc(hex), sel: esc(sel) });
}

// 카드 3-②: 이벤트 topic0 = keccak(시그니처) 전체 32바이트
function updateTopic0() {
  const el = $("ethTopicOut");
  if (!el || !ethKeccakFn) return;
  const sig = ($("ethTopicIn")?.value || "").trim();
  if (!sig) {
    el.textContent = "";
    return;
  }
  const hex = ethKeccakFn(sig);
  el.innerHTML = t("eth.kc.topicOut", { sig: esc(sig), hash: esc(hex) });
}

// 카드 3-③: 컨트랙트 주소 = keccak(배포자주소:nonce) 끝 20바이트 (renderDerive와 동일 preimage)
function updateContractAddr() {
  const el = $("ethKcCaOut");
  if (!el || !ethKeccakFn || !ethAddrFn) return;
  const deployer = ($("ethKcCaDeployer")?.value || "").trim();
  const nonce = Math.max(0, parseInt($("ethKcCaNonce")?.value, 10) || 0);
  if (!deployer) {
    el.textContent = "";
    return;
  }
  const walletAddr = ethAddrFn(deployer);
  const preimage = `${walletAddr}:${nonce}`;
  const hex = ethKeccakFn(preimage);
  const addr = `0x${hex.slice(-40)}`;
  el.innerHTML = t("eth.kc.caOut", { pre: esc(preimage), addr: esc(addr) });
}

function updateKeccakTab() {
  updateKcPlayground();
  updateKeccak();
  updateSelector();
  updateTopic0();
  updateContractAddr();
}

// ---------- 컨트랙트 공용 렌더 ----------

function renderContractHead(boxId, c, extra = "") {
  const el = $(boxId);
  if (!el) return;
  if (!c) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `
    <span class="eth-ch-name">${esc(c.name)}</span>
    <span class="eth-ch-kind">${esc(c.kind)}</span>
    <span class="mono eth-ch-addr" title="${esc(c.address)}">${esc(shortAddr(c.address))}</span>
    <span class="eth-ch-bal mono">${Number(c.balanceEth).toFixed(4)} ETH</span>
    <span class="eth-ch-meta">${t("eth.sc.deployedBy", { by: esc(c.deployer), nonce: c.createdNonce })}</span>
    ${extra}`;
}

function renderStorage(boxId, c, changedKeys = []) {
  const el = $(boxId);
  if (!el) return;
  if (!c) {
    el.innerHTML = "";
    return;
  }
  const rows = Object.entries(c.storage)
    .map(([k, v]) => {
      const hl = changedKeys.includes(k) ? " changed" : "";
      return `<div class="eth-slot${hl}"><span class="k mono">${esc(k)}</span><span class="v mono">${esc(v)}</span></div>`;
    })
    .join("");
  el.innerHTML = rows || `<div class="empty">${t("eth.sc.storageEmpty")}</div>`;
}

function renderEvents(boxId, address, limit = 8) {
  const el = $(boxId);
  if (!el) return;
  const evs = allEvents()
    .filter((e) => !address || e.contract === address)
    .slice(-limit)
    .reverse();
  if (!evs.length) {
    el.innerHTML = `<div class="empty">${t("eth.sc.eventsEmpty")}</div>`;
    return;
  }
  el.innerHTML = evs
    .map(
      (e) => `<div class="eth-event">
      <div class="eth-event-head"><b>${esc(e.name)}</b><span class="mono sig">${esc(e.signature)}</span></div>
      <div class="eth-event-args">${e.args.map(([k, v]) => `<span><em>${esc(k)}</em> = ${esc(v)}</span>`).join(" · ")}</div>
      <div class="eth-event-topic mono">topic0 = keccak(sig) = ${esc(e.topic0.slice(0, 18))}…</div>
    </div>`
    )
    .join("");
}

function renderReceipt(boxId, r) {
  const el = $(boxId);
  if (!el) return;
  if (!r) {
    el.hidden = true;
    el.innerHTML = "";
    return;
  }
  el.hidden = false;
  const cls = r.reverted ? "reverted" : "ok";
  const head = r.reverted
    ? `<span class="eth-rc-status bad">⛔ REVERT</span> <span class="eth-rc-reason">${esc(r.error || "")}</span>`
    : `<span class="eth-rc-status good">✅ ${esc(r.note || "OK")}</span>`;
  const burn = Number(r.base_fee_burned_eth || 0).toFixed(6);
  const tip = Number(r.tip_eth || 0).toFixed(6);
  el.innerHTML = `
    <div class="eth-receipt-inner ${cls}">
      <div class="eth-rc-head">${head}</div>
      <div class="eth-rc-row mono">
        <span>gas_used <b>${Number(r.gas_used).toLocaleString()}</b></span>
        <span>🔥 ${burn}</span>
        <span>tip ${tip} → ${esc(r.proposer || "")}</span>
        ${r.nonce != null ? `<span>nonce ${r.nonce}</span>` : ""}
      </div>
      ${r.reverted ? `<div class="eth-rc-note">${t("eth.sc.revertNote")}</div>` : ""}
    </div>`;
}

// ---------- 상태 DB(world state) 실시간 테이블 ----------

function renderWorldState() {
  const el = $("ethWorldState");
  if (!el || !eth) return;
  const snap = JSON.parse(eth.accounts_snapshot());
  const eoas = snap.accounts.filter(
    (a) => a.label !== "Faucet" && (["Alice", "Bob", "Carol"].includes(a.label) || a.nonce > 0 || a.balanceEth > 0)
  );
  const cs = contracts();
  const head = `<div class="eth-ws-row head">
    <span>${t("eth.ws.colAcct")}</span><span>balance</span><span>nonce</span><span>code</span><span>storage</span>
  </div>`;
  const eoaRows = eoas
    .map(
      (a) => `<div class="eth-ws-row">
      <span><b class="eth-ws-tag eoa">EOA</b> ${esc(a.label)} <span class="mono muted-addr" title="${esc(a.address)}">${esc(shortAddr(a.address))}</span></span>
      <span class="mono">${Number(a.balanceEth).toFixed(4)}</span>
      <span class="mono">${a.nonce}</span>
      <span class="muted">${t("eth.ws.codeNone")}</span>
      <span class="muted">—</span>
    </div>`
    )
    .join("");
  const originOf = (c) => {
    if (c.deployer === "Faucet") {
      if (c.kind === "erc20") return t("eth.ws.originTok");
      if (c.kind === "pricefeed") return t("eth.ws.originFeed");
      return t("eth.ws.originGenesis");
    }
    return t("eth.ws.originYou", { who: esc(c.deployer) });
  };
  const caRows = cs
    .map(
      (c) => `<div class="eth-ws-row ca">
      <span><b class="eth-ws-tag ca">Contract</b> ${esc(c.name)} <span class="mono muted-addr" title="${esc(c.address)}">${esc(shortAddr(c.address))}</span> <span class="eth-ws-origin">${originOf(c)}</span></span>
      <span class="mono">${Number(c.balanceEth).toFixed(4)}</span>
      <span class="mono">—</span>
      <span>${t("eth.ws.codeYes", { kind: esc(c.kind) })}</span>
      <span class="mono">${Object.keys(c.storage).length} slots</span>
    </div>`
    )
    .join("");
  el.innerHTML = head + eoaRows + caRows;
}

// ---------- 2 · Smart Contracts 탭 ----------

function scContract() {
  return scAddr ? findContract((c) => c.address === scAddr) : null;
}

/** 배포 순간의 주소 유도 과정: 지갑 주소 + nonce → keccak → 컨트랙트 주소 */
function renderDerive(deployer, nonce, contractAddr) {
  const el = $("ethScDerive");
  if (!el || !ethKeccakFn || !ethAddrFn) return;
  const walletAddr = ethAddrFn(deployer);
  // Rust contract_address() 와 같은 preimage: "지갑주소:nonce"
  const preimage = `${walletAddr}:${nonce}`;
  const hash = ethKeccakFn(preimage);
  const derived = `0x${hash.slice(-40)}`;
  const match = derived === contractAddr;
  el.hidden = false;
  el.innerHTML = `
    <div class="eth-derive-title">${t("eth.sc.deriveH")}</div>
    <div class="eth-derive-step">
      <span class="no">1</span>
      <div>
        <div class="lbl">${t("eth.sc.derive1", { who: esc(deployer) })}</div>
        <div class="mono val">${esc(walletAddr)}</div>
      </div>
    </div>
    <div class="eth-derive-step">
      <span class="no">2</span>
      <div>
        <div class="lbl">${t("eth.sc.derive2", { nonce })}</div>
        <div class="mono val">"${esc(preimage)}"</div>
      </div>
    </div>
    <div class="eth-derive-step">
      <span class="no">3</span>
      <div>
        <div class="lbl">${t("eth.sc.derive3")}</div>
        <div class="mono val eth-keccak-hash"><span class="eth-hash-drop">${esc(hash.slice(0, -40))}</span><span class="eth-hash-keep">${esc(hash.slice(-40))}</span></div>
      </div>
    </div>
    <div class="eth-derive-step">
      <span class="no">4</span>
      <div>
        <div class="lbl">${t("eth.sc.derive4")}</div>
        <div class="mono val eth-keccak-addr">${esc(derived)} ${match ? `<span class="eth-derive-ok">${t("eth.sc.deriveMatch")}</span>` : ""}</div>
      </div>
    </div>
    <div class="eth-derive-note">${t("eth.sc.deriveNote")}</div>`;
}

/** 히스토리에 새 버전(또는 revert 시도) 추가 */
function pushScHistory(label, prevStorage, reverted, reason) {
  if (reverted) {
    scHistory.push({ ver: null, label, changes: [], reverted: true, reason });
    return;
  }
  const cur = scContract()?.storage || {};
  const keys = new Set([...Object.keys(prevStorage || {}), ...Object.keys(cur)]);
  const changes = [];
  for (const k of keys) {
    const from = prevStorage ? prevStorage[k] : undefined;
    const to = cur[k];
    if (from !== to) changes.push({ k, from, to });
  }
  const ver = scHistory.filter((h) => !h.reverted).length;
  scHistory.push({ ver, label, changes, reverted: false });
}

function renderScHistory() {
  const el = $("ethScHistory");
  if (!el) return;
  if (!scHistory.length) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = [...scHistory]
    .reverse()
    .map((h) => {
      if (h.reverted) {
        return `<div class="eth-hist reverted">
          <span class="ver">⛔</span>
          <div>
            <div class="lbl">${esc(h.label)} — <b>revert</b></div>
            <div class="chg muted">${t("eth.sc.histRevert", { reason: esc(h.reason || "") })}</div>
          </div>
        </div>`;
      }
      const chg = h.changes.length
        ? h.changes
            .map((c) =>
              c.from === undefined
                ? `<span class="mono"><em>${esc(c.k)}</em> = ${esc(c.to)}</span>`
                : `<span class="mono"><em>${esc(c.k)}</em>: ${esc(c.from)} → <b>${esc(c.to)}</b></span>`
            )
            .join(" · ")
        : t("eth.sc.histNoChange");
      return `<div class="eth-hist">
        <span class="ver">v${h.ver}</span>
        <div>
          <div class="lbl">${esc(h.label)}</div>
          <div class="chg">${chg}</div>
        </div>
      </div>`;
    })
    .join("");
}

function renderScTab(changedKeys = []) {
  const c = scContract();
  const wrap = $("ethScMachine");
  if (wrap) wrap.hidden = !c;
  if (!c) {
    const code = $("ethScCode");
    if (code) code.innerHTML = renderSolidity("vending", null);
    renderWorldState();
    return;
  }
  renderContractHead("ethScAddrBox", c);
  renderStorage("ethScStorage", c, changedKeys);
  renderScHistory();
  renderEvents("ethScEvents", c.address);
  renderWorldState();
  const code = $("ethScCode");
  if (code) code.innerHTML = renderSolidity("vending", scHighlight);
}

function wireScTab() {
  $("ethScDeployBtn")?.addEventListener("click", () => {
    const deployer = ($("ethScDeployer")?.value || "Alice").trim();
    const price = Number($("ethScPrice")?.value) || 0.5;
    const stock = Math.max(1, Number($("ethScStock")?.value) || 3);
    const args = JSON.stringify({ priceEth: price, stock, name: "SnackMachine" });
    const r = JSON.parse(eth.deploy_contract("vending", deployer, args, 0, DEFAULT_TIP));
    if (r.ok) {
      scAddr = r.address;
      scHighlight = "constructor";
      scHistory = [];
      pushScHistory(`constructor(${price} ETH, ${stock}) · deploy by ${deployer}`, null, false);
      renderDerive(deployer, r.nonce, r.address);
      statusMsg(
        "ethScDeployMsg",
        t("eth.sc.deployOk", {
          addr: shortAddr(r.address),
          nonce: r.nonce,
          gas: Number(r.gas_used).toLocaleString(),
        }),
        true
      );
      renderReceipt("ethScReceipt", r);
    } else {
      statusMsg("ethScDeployMsg", r.error, false);
    }
    renderScTab();
    renderAccounts();
    pushLogs("ethScLog");
  });

  const call = (func) => {
    if (!scAddr) return;
    const caller = ($("ethScCaller")?.value || "Bob").trim();
    const value = func === "buy" ? Number($("ethScValue")?.value) || 0 : 0;
    const prevStorage = { ...(scContract()?.storage || {}) };
    const r = JSON.parse(eth.call_contract(scAddr, func, "{}", caller, value, DEFAULT_TIP));
    scHighlight = func;
    const label = `${func}() · by ${caller}${value ? ` · ${value} ETH` : ""}`;
    if (r.reverted) pushScHistory(label, prevStorage, true, r.error);
    else if (r.ok) pushScHistory(label, prevStorage, false);
    renderReceipt("ethScReceipt", r);
    statusMsg("ethScCallMsg", "", true);
    if (!r.ok && !r.reverted) statusMsg("ethScCallMsg", r.error, false);
    renderScTab(func === "buy" ? ["stock", "totalSold"] : []);
    renderAccounts();
    pushLogs("ethScLog");
  };
  $("ethScBuyBtn")?.addEventListener("click", () => call("buy"));
  $("ethScWithdrawBtn")?.addEventListener("click", () => call("withdraw"));
}

// ---------- 3 · Tokens 탭 ----------

function sandContract() {
  return findContract((c) => c.kind === "erc20");
}

function renderTokTab(changedKeys = []) {
  const c = sandContract();
  renderContractHead("ethTokAddrBox", c);
  renderStorage("ethTokStorage", c, changedKeys);
  renderEvents("ethTokEvents", c?.address);
  const code = $("ethTokCode");
  if (code) code.innerHTML = renderSolidity("erc20", tokHighlight);
  renderErcContrast(c);
}

function renderErcContrast(c) {
  const el = $("ethErcContrast");
  if (!el || !eth) return;
  const snap = JSON.parse(eth.accounts_snapshot());
  const ethOf = (label) => {
    const a = snap.accounts.find((x) => x.label === label);
    return a ? Number(a.balanceEth).toFixed(4) : "—";
  };
  const tokOf = (label) => {
    const v = c?.storage?.[`balance[${label}]`];
    return v != null ? v : "0";
  };
  const name = c?.name || "SAND";
  el.innerHTML = `
    <div class="eth-contrast-card">
      <div class="k">${t("eth.acc.contrastEth")}</div>
      <div class="v mono">Alice ${ethOf("Alice")} ETH</div>
      <div class="v mono">Bob ${ethOf("Bob")} ETH</div>
      <div class="note">${t("eth.acc.contrastEthHint")}</div>
    </div>
    <div class="eth-contrast-card tok">
      <div class="k">${t("eth.acc.contrastTok", { token: esc(name) })}</div>
      <div class="v mono">Alice ${esc(tokOf("Alice"))} ${esc(name)}</div>
      <div class="v mono">Bob ${esc(tokOf("Bob"))} ${esc(name)}</div>
      <div class="note">${t("eth.acc.contrastTokHint")}</div>
    </div>`;
}

function wireTokTab() {
  $("ethTokSend")?.addEventListener("click", () => {
    const c = sandContract();
    if (!c) return;
    const from = ($("ethTokFrom")?.value || "Alice").trim();
    const to = ($("ethTokTo")?.value || "Bob").trim();
    const amt = Number($("ethTokAmt")?.value) || 0;
    const args = JSON.stringify({ to, amount: amt });
    const r = JSON.parse(eth.call_contract(c.address, "transfer", args, from, 0, DEFAULT_TIP));
    tokHighlight = "transfer";
    renderReceipt("ethTokReceipt", r);
    statusMsg(
      "ethTokMsg",
      r.ok ? t("eth.acc.tokOk", { token: c.name, from, to, amt: String(amt) }) : "",
      r.ok
    );
    if (!r.ok && !r.reverted) statusMsg("ethTokMsg", r.error, false);
    renderTokTab([`balance[${from}]`, `balance[${to}]`]);
    renderAccounts();
    pushLogs("ethTokLog");
  });
}

// ---------- 4 · Oracles 탭 ----------

function feedContract() {
  return findContract((c) => c.kind === "pricefeed");
}

function insContract() {
  return insAddr ? findContract((c) => c.address === insAddr) : null;
}

function renderInsLedger() {
  const el = $("ethInsLedger");
  if (!el || !eth) return;
  const by = Object.fromEntries(JSON.parse(eth.accounts_snapshot()).accounts.map((a) => [a.label, a]));
  const acctChip = (label, role) => {
    const a = by[label];
    if (!a) return "";
    const bal = Number(a.balanceEth);
    const prev = prevInsBal[label];
    const delta = prev != null ? bal - prev : null;
    const flash = delta != null && Math.abs(delta) > 1e-12 ? (delta > 0 ? "up" : "down") : "";
    return chipHtml({ label, bal, roleText: t("eth.ins.role." + role), roleCls: role, flash, delta });
  };
  const rows = [acctChip("Alice", "underwriter"), acctChip("Bob", "insured")];
  const ins = insContract();
  if (ins) {
    const bal = Number(ins.balanceEth);
    const prev = prevInsBal.pool;
    const delta = prev != null ? bal - prev : null;
    const flash = delta != null && Math.abs(delta) > 1e-12 ? (delta > 0 ? "up" : "down") : "";
    rows.push(
      chipHtml({ label: ins.name, bal, roleText: t("eth.ins.role.pool"), roleCls: "contract", flash, delta, lock: bal > 0 })
    );
    prevInsBal.pool = bal;
  } else {
    prevInsBal.pool = null;
  }
  el.innerHTML = rows.join("");
  prevInsBal.Alice = Number(by.Alice?.balanceEth ?? 0);
  prevInsBal.Bob = Number(by.Bob?.balanceEth ?? 0);
}

function renderOracleTab(changedIns = []) {
  const feed = feedContract();
  renderContractHead("ethFeedAddrBox", feed);
  renderInsLedger();
  const nodesEl = $("ethOracleNodes");
  if (nodesEl && feed) {
    const oracles = (feed.storage["oracles"] || "").split(", ").filter(Boolean);
    nodesEl.innerHTML = oracles
      .map((n) => {
        const reported = feed.storage[`report[${n}]`] ?? "—";
        return `<div class="eth-oracle-node">
          <div class="eth-on-head"><b>${esc(n)}</b><span class="mono">${t("eth.or.reported")}: ${esc(reported)}</span></div>
          <div class="row" style="margin-top:6px">
            <input class="eth-on-price" data-node="${esc(n)}" type="number" value="${oraclePrices[n] ?? 3000}" step="10" />
            <button class="btn small-btn" data-report="${esc(n)}">report()</button>
          </div>
        </div>`;
      })
      .join("");
  }
  const ansEl = $("ethFeedAnswer");
  if (ansEl && feed) {
    const ans = feed.storage["latestAnswer"] ?? "—";
    ansEl.innerHTML = `<span class="k">latestAnswer (median)</span><span class="v mono">${esc(ans)}</span>`;
  }
  renderEvents("ethFeedEvents", feed?.address, 6);
  const code = $("ethFeedCode");
  if (code) code.innerHTML = renderSolidity("pricefeed", feedHighlight);

  // insurance
  const ins = insContract();
  const panel = $("ethInsPanel");
  if (panel) panel.hidden = !ins;
  if (ins) {
    renderContractHead("ethInsAddrBox", ins);
    renderStorage("ethInsStorage", ins, changedIns);
    renderInsCond(ins, feed);
  }
}

/** 지급 조건(median < threshold)을 현재 median 값과 함께 보여준다 */
function renderInsCond(ins, feed) {
  const el = $("ethInsCond");
  if (!el) return;
  const threshold = Number(ins.storage["threshold(USD)"]) || 0;
  const medianRaw = feed?.storage?.["latestAnswer"] ?? "—";
  const median = Number(medianRaw);
  const hasMedian = medianRaw !== "—" && !Number.isNaN(median);
  const met = hasMedian && median < threshold;
  const cls = !hasMedian ? "" : met ? "met" : "unmet";
  const verdict = !hasMedian
    ? t("eth.ins.condNoFeed")
    : met
      ? t("eth.ins.condMet", { median: median.toFixed(2), threshold: String(threshold) })
      : t("eth.ins.condUnmet", { median: median.toFixed(2), threshold: String(threshold) });
  el.innerHTML = `<span class="rule mono">${t("eth.ins.condRule", { threshold: String(threshold) })}</span><span class="verdict ${cls}">${verdict}</span>`;
}

function wireOracleTab() {
  $("ethOracleNodes")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-report]");
    if (!btn) return;
    const node = btn.getAttribute("data-report");
    const input = $("ethOracleNodes")?.querySelector(`.eth-on-price[data-node="${node}"]`);
    const price = Number(input?.value) || 0;
    oraclePrices[node] = price;
    const feed = feedContract();
    if (!feed) return;
    const r = JSON.parse(
      eth.call_contract(feed.address, "report", JSON.stringify({ price }), node, 0, DEFAULT_TIP)
    );
    feedHighlight = "report";
    statusMsg("ethFeedMsg", r.ok ? r.note : r.error, r.ok);
    renderOracleTab();
    pushLogs("ethOrLog");
  });

  $("ethInsDeployBtn")?.addEventListener("click", () => {
    const feed = feedContract();
    if (!feed) return;
    const threshold = Number($("ethInsThreshold")?.value) || 3000;
    const args = JSON.stringify({
      feed: feed.address,
      threshold,
      payoutEth: 1.0,
      premiumEth: 0.1,
      name: "PriceProtection",
    });
    const r = JSON.parse(eth.deploy_contract("insurance", "Alice", args, 1.0, DEFAULT_TIP));
    if (r.ok) {
      insAddr = r.address;
      insHighlight = "constructor";
      statusMsg(
        "ethInsMsg",
        t("eth.sc.deployOk", {
          addr: shortAddr(r.address),
          nonce: r.nonce,
          gas: Number(r.gas_used).toLocaleString(),
        }),
        true
      );
    } else {
      statusMsg("ethInsMsg", r.error, false);
    }
    renderOracleTab();
    renderAccounts();
    pushLogs("ethOrLog");
  });

  const insCall = (func, caller, value) => {
    if (!insAddr) return;
    const r = JSON.parse(eth.call_contract(insAddr, func, "{}", caller, value, DEFAULT_TIP));
    insHighlight = func;
    renderReceipt("ethInsReceipt", r);
    statusMsg("ethInsMsg", r.ok ? r.note : r.reverted ? "" : r.error, r.ok);
    renderOracleTab(["status", "insured"]);
    renderAccounts();
    pushLogs("ethOrLog");
  };
  $("ethInsBuyBtn")?.addEventListener("click", () => insCall("buy_policy", "Bob", 0.1));
  $("ethInsSettleBtn")?.addEventListener("click", () => insCall("settle", "Carol", 0));
}

// ---------- 5 · PoS 탭 ----------

function renderValidators() {
  if (!eth) return;
  const vals = JSON.parse(eth.validators_snapshot());
  const box = $("ethValidators");
  if (!box) return;
  box.innerHTML = vals
    .map((v) => {
      const st = v.status;
      const cls =
        st === "Slashed" ? "slashed" : st === "Active" ? "active" : st === "Pending" ? "pending" : "";
      return `<div class="eth-val-row ${cls}">
        <span class="id">#${v.id}</span>
        <span class="who">${esc(v.label)}</span>
        <span class="tag">${esc(st)}</span>
        <span class="bal">${Number(v.effective_balance).toFixed(2)} ETH</span>
      </div>`;
    })
    .join("");
}

function renderPos() {
  if (!eth) return;
  const snap = JSON.parse(eth.pos_snapshot());
  const stats = $("ethSlotStats");
  if (stats) {
    stats.innerHTML = `
      <div class="stat blue"><div class="k">Slot</div><div class="v">${snap.slot}</div></div>
      <div class="stat"><div class="k">Epoch</div><div class="v">${snap.epoch}</div></div>
      <div class="stat green"><div class="k">Head</div><div class="v">${snap.head_slot ?? "—"}</div></div>
      <div class="stat"><div class="k">Justified</div><div class="v">${snap.justified_epoch < 0 ? "—" : "epoch " + snap.justified_epoch}</div></div>
      <div class="stat btc"><div class="k">Finalized</div><div class="v">${snap.finalized_epoch < 0 ? "—" : "epoch " + snap.finalized_epoch}</div></div>
      <div class="stat"><div class="k">Proposer</div><div class="v" style="font-size:14px">${esc(snap.last_proposer || "—")}</div></div>
    `;
  }
  const renderChain = (elId) => {
    const chain = $(elId);
    if (!chain) return;
    chain.innerHTML = snap.blocks
      .map((b) => {
        const fork = b.slot >= 1000; // 교육용: 슬롯 1000+ 는 포크 블록
        const flags = [
          b.finalized ? "finalized" : "",
          b.justified && !b.finalized ? "justified" : "",
          fork ? "fork" : "",
          snap.head_slot === b.slot ? "head" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const sr = b.state_root
          ? `<div class="mono eb-sr">stateRoot ${esc(b.state_root.slice(0, 10))}…${esc(b.state_root.slice(-6))}</div>`
          : "";
        const attesters = b.attesters || [];
        const offline = b.offline || [];
        const att = attesters.length + offline.length > 0
          ? `<div class="eb-att">attest ${attesters.length}/${attesters.length + offline.length} · ${
              attesters.map((n) => `<span class="att-v ok">${esc(n)} ✓</span>`).join(" ")
            }${offline.length ? " " + offline.map((n) => `<span class="att-v off">${esc(n)} ✗</span>`).join(" ") : ""}</div>`
          : "";
        return `<div class="eth-block ${flags}">
          <div class="eb-head">slot ${fork ? b.slot + " (fork)" : b.slot} · ${esc(b.proposer)}</div>
          <div class="mono eb-hash">${esc(b.hash)}</div>
          ${sr}
          ${att}
          <div class="eb-meta">weight ${Number(b.attest_weight).toFixed(1)}
            ${b.finalized ? " · ✅ finalized" : b.justified ? " · justified" : ""}
            ${snap.head_slot === b.slot ? " · HEAD" : ""}
          </div>
        </div>`;
      })
      .join('<div class="eth-link">↓</div>');
    // 최신 블록(맨 아래)이 보이도록 자동 스크롤
    chain.scrollTop = chain.scrollHeight;
  };
  renderChain("ethSlotChain");
  renderChain("ethAtkChain");
}

function offlineFrac() {
  const el = $("ethOfflineFrac");
  return el ? Number(el.value) / 100 : 0;
}

// "다음 slot" 직후: 방금 만들어진 블록에 validator들이 한 명씩 투표하는 과정을 재생
function playAttestLive() {
  const panel = $("ethAttestLive");
  if (!eth || !panel) return;
  const snap = JSON.parse(eth.pos_snapshot());
  const b = snap.blocks.find((x) => x.slot === snap.slot);
  if (!b) return;
  const attesters = b.attesters || [];
  const offline = b.offline || [];
  const total = attesters.length + offline.length;
  if (!total) return;

  const vals = JSON.parse(eth.validators_snapshot());
  const balOf = (label) => vals.find((v) => v.label === label)?.effective_balance ?? 0;
  const totalW = attesters.concat(offline).reduce((s, n) => s + balOf(n), 0);
  const pct = totalW > 0 ? (b.attest_weight / totalW) * 100 : 0;
  const passed = pct >= (200 / 3) - 1e-9;
  const STEP = 220; // 칩 하나당 등장 간격(ms)

  const chips =
    attesters
      .map((n, i) => `<span class="al-chip ok" style="animation-delay:${i * STEP}ms">${esc(n)} ✓</span>`)
      .join("") +
    offline
      .map((n, i) => `<span class="al-chip off" style="animation-delay:${(attesters.length + i) * STEP}ms">${esc(n)} ✗</span>`)
      .join("");

  panel.hidden = false;
  panel.innerHTML = `
    <div class="al-head">${t("eth.pos.liveHead", { slot: b.slot, p: esc(b.proposer) })}</div>
    <div class="al-chips">${chips}</div>
    <div class="al-bar"><div class="al-fill ${passed ? "ok" : "fail"}"></div><div class="al-th"></div></div>
    <div class="al-meta">attest ${attesters.length}/${total} · weight ${pct.toFixed(0)}% — ${
      passed ? t("eth.pos.liveOk") : t("eth.pos.liveFail")
    }</div>
  `;
  // 칩이 다 나타난 뒤 게이지가 차오르도록
  const fill = panel.querySelector(".al-fill");
  setTimeout(() => {
    if (fill) fill.style.width = pct.toFixed(1) + "%";
  }, total * STEP + 100);
}

function wirePosTab() {
  const advance = (n) => {
    for (let i = 0; i < n; i++) eth.advance_slot(offlineFrac());
    renderPos();
    renderValidators();
    playAttestLive();
    pushLogs("ethPosLog");
  };
  $("ethAdvanceBtn")?.addEventListener("click", () => advance(1));
  $("ethAdvance5Btn")?.addEventListener("click", () => advance(5));
  $("ethGpAdvanceEpoch")?.addEventListener("click", () => {
    const snap = JSON.parse(eth.pos_snapshot());
    const left = 8 - (snap.slot % 8);
    advance(left === 0 ? 8 : left);
  });
  $("ethAtkAdvance")?.addEventListener("click", () => advance(1));

  $("ethOfflineFrac")?.addEventListener("input", (e) => {
    $("ethOfflineVal").textContent = e.target.value;
  });

  $("ethDepositBtn")?.addEventListener("click", () => {
    const r = JSON.parse(eth.stake_deposit($("ethStakeLabel").value.trim(), Number($("ethStakeAmt").value)));
    if (r.ok) lastDepositId = r.id;
    statusMsg("ethStakeMsg", r.ok ? t("eth.st.depOk", { id: r.id }) : r.error, r.ok);
    renderValidators();
    pushLogs("ethPosLog");
  });

  $("ethActivateBtn")?.addEventListener("click", () => {
    const id = lastDepositId ?? Number($("ethSlashId").value);
    const r = JSON.parse(eth.stake_activate(id));
    statusMsg("ethStakeMsg", r.ok ? t("eth.st.actOk") : r.error, r.ok);
    renderValidators();
    pushLogs("ethPosLog");
  });

  $("ethSlashBtn")?.addEventListener("click", () => {
    const r = JSON.parse(eth.stake_slash(Number($("ethSlashId").value), "이중서명(equivocation)"));
    statusMsg("ethStakeMsg", r.ok ? t("eth.st.slashOk") : r.error, r.ok);
    renderValidators();
    pushLogs("ethPosLog");
  });

  $("ethOfflineBtn")?.addEventListener("click", () => {
    const r = JSON.parse(eth.stake_offline(Number($("ethSlashId").value), 0.5));
    statusMsg("ethStakeMsg", r.ok ? t("eth.st.offOk") : r.error, r.ok);
    renderValidators();
    pushLogs("ethPosLog");
  });

  $("ethForkBtn")?.addEventListener("click", () => {
    const r = JSON.parse(eth.fork_attack(Number($("ethAtkId").value)));
    statusMsg("ethAtkMsg", r.ok ? r.message : r.error, r.ok);
    renderPos();
    renderValidators();
    pushLogs("ethPosLog");
  });

  $("ethPosReset")?.addEventListener("click", () => {
    eth.reset();
    lastDepositId = null;
    prevBalances = {};
    flashLabels = new Set();
    lastFlow = null;
    scAddr = null;
    scHighlight = null;
    scHistory = [];
    tokHighlight = null;
    feedHighlight = null;
    insAddr = null;
    insHighlight = null;
    prevInsBal = { Alice: null, Bob: null, pool: null };
    const attestLive = $("ethAttestLive");
    if (attestLive) {
      attestLive.hidden = true;
      attestLive.innerHTML = "";
    }
    const derive = $("ethScDerive");
    if (derive) {
      derive.hidden = true;
      derive.innerHTML = "";
    }
    renderFlow(null);
    renderReceipt("ethScReceipt", null);
    renderReceipt("ethTokReceipt", null);
    renderReceipt("ethInsReceipt", null);
    clearLogs("ethAccLog", "ethScLog", "ethTokLog", "ethOrLog", "ethPosLog");
    renderAll();
  });
}

// ---------- 1 · 계정 탭 wiring ----------

function wireAccountTab() {
  const updateFeePreview = () => {
    const el = $("ethFeePreview");
    if (!el) return;
    const gwei = Math.max(0, Number($("ethGas")?.value) || 0);
    const value = Math.max(0, Number($("ethAmt")?.value) || 0);
    const from = ($("ethFrom")?.value || "Alice").trim() || "Alice";
    const burn = (GAS_LIMIT * BASE_FEE_GWEI) / 1e9;
    const tip = (GAS_LIMIT * gwei) / 1e9;
    const paid = value + burn + tip;
    const prop = currentProposer();
    el.textContent = t("eth.acc.feePreview", {
      burn: burn.toFixed(6),
      tip: tip.toFixed(6),
      prop,
      from,
      paid: paid.toFixed(6),
    });
  };
  for (const id of ["ethGas", "ethAmt", "ethFrom", "ethTo"]) {
    $(id)?.addEventListener("input", updateFeePreview);
    $(id)?.addEventListener("change", updateFeePreview);
  }
  $("ethFrom")?.addEventListener("input", renderNonceInfo);
  $("ethFrom")?.addEventListener("change", renderNonceInfo);
  updateFeePreview();
  renderNonceInfo();
  document.addEventListener("i18n:changed", () => {
    updateFeePreview();
    renderNonceInfo();
    if (lastFlow) renderFlow(lastFlow);
  });

  $("ethSendBtn")?.addEventListener("click", () => {
    const gwei = Number($("ethGas").value);
    const value = Number($("ethAmt").value);
    const from = $("ethFrom").value.trim();
    const to = $("ethTo").value.trim();
    const r = JSON.parse(eth.transfer(from, to, value, gwei));
    const burn = Number(r.base_fee_burned_eth) || 0;
    const tip = Number(r.tip_eth) || 0;
    if (r.ok) {
      const valueEth = Number(r.value_eth ?? value);
      const paid = valueEth + burn + tip;
      const prop = r.proposer || currentProposer();
      flashLabels = new Set([from, to, prop].filter(Boolean));
      renderFlow({
        from: r.from || from,
        to: r.to || to,
        value: valueEth.toFixed(6),
        burn: burn.toFixed(6),
        tip: tip.toFixed(6),
        prop,
        paid: paid.toFixed(6),
        nonce: r.nonce,
      });
      statusMsg("ethAccMsg", "", true);
      renderAccounts();
      renderNonceInfo();
      setTimeout(() => {
        flashLabels = new Set();
        renderAccounts();
      }, 1600);
    } else {
      renderFlow(null);
      statusMsg("ethAccMsg", r.error || t("eth.acc.sendFail"), false);
      renderAccounts();
    }
    pushLogs("ethAccLog");
    updateFeePreview();
  });

}

// ---------- 1 · Keccak · 주소 탭 wiring ----------

function wireKeccakTab() {
  $("ethKcPlayIn")?.addEventListener("input", updateKcPlayground);
  $("ethKeccakIn")?.addEventListener("input", updateKeccak);

  $("ethSelIn")?.addEventListener("input", updateSelector);
  document.querySelectorAll("[data-eth-sel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if ($("ethSelIn")) $("ethSelIn").value = btn.getAttribute("data-eth-sel") || "";
      updateSelector();
    });
  });

  $("ethTopicIn")?.addEventListener("input", updateTopic0);
  document.querySelectorAll("[data-eth-topic]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if ($("ethTopicIn")) $("ethTopicIn").value = btn.getAttribute("data-eth-topic") || "";
      updateTopic0();
    });
  });

  for (const id of ["ethKcCaDeployer", "ethKcCaNonce"]) {
    $(id)?.addEventListener("input", updateContractAddr);
  }

  document.addEventListener("i18n:changed", () => {
    updateSelector();
    updateTopic0();
    updateContractAddr();
  });
}

// ---------- 7 · 부동산 에스크로 탭 ----------

let reAddr = null; // 배포한 Escrow 주소
let reHighlight = null; // 마지막 호출 함수 (solidity 하이라이트)
/** @type {Array<{no:number, genesis?:boolean, tx?:object, stateRoot:string}>} */
let reBlocks = [];
let reBlockNo = 0;

function reContract() {
  return reAddr ? findContract((c) => c.address === reAddr) : null;
}

function reState() {
  const c = reContract();
  return c ? c.storage.state || "Listed" : "None";
}

function rePriceEth() {
  const c = reContract();
  if (c && c.storage.price) return parseFloat(c.storage.price) || 0;
  return Number($("ethRePrice")?.value) || 0;
}

/** 프론트에서 계산하는 교육용 stateRoot = keccak(정렬된 계정+컨트랙트 스냅샷) */
function computeStateRoot() {
  if (!eth || !ethKeccakFn) return "0x" + "0".repeat(64);
  const parts = [];
  try {
    const acc = JSON.parse(eth.accounts_snapshot())
      .accounts.slice()
      .sort((a, b) => a.label.localeCompare(b.label));
    for (const a of acc)
      parts.push(`${a.label}|${a.address}|${Number(a.balanceEth).toFixed(6)}|${a.nonce}`);
    const cs = contracts()
      .slice()
      .sort((a, b) => a.address.localeCompare(b.address));
    for (const c of cs) {
      const st = Object.entries(c.storage)
        .sort((x, y) => x[0].localeCompare(y[0]))
        .map(([k, v]) => `${k}=${v}`)
        .join(",");
      parts.push(`${c.address}|${c.kind}|${Number(c.balanceEth).toFixed(6)}|${st}`);
    }
  } catch {}
  return "0x" + ethKeccakFn(parts.join("\n"));
}

function pushReBlock(tx) {
  reBlocks.push({ no: ++reBlockNo, tx, stateRoot: computeStateRoot() });
}

function renderReStage() {
  const el = $("ethReStage");
  if (!el) return;
  const seller = ($("ethReSeller")?.value || "Bob").trim();
  const buyer = ($("ethReBuyer")?.value || "Alice").trim();
  const inspector = ($("ethReInspector")?.value || "Carol").trim();
  const c = reContract();
  const state = c ? c.storage.state || "Listed" : "None";
  const locked = c ? Number(c.balanceEth) : 0;
  const priceStr = c
    ? c.storage.price || ""
    : `${(Number($("ethRePrice")?.value) || 0).toFixed(6)} ETH`;

  const depositArrow =
    state === "Listed" ? "active" : ["Funded", "Confirmed", "Released"].includes(state) ? "done" : "";
  const confirmArrow =
    state === "Funded" ? "active" : ["Confirmed", "Released"].includes(state) ? "done" : "";
  const releaseArrow = state === "Confirmed" ? "active" : state === "Released" ? "done" : "";

  const buyerActive = state === "Listed" ? "active" : "";
  const inspectorActive = state === "Funded" ? "active" : "";
  const sellerActive = state === "Confirmed" || state === "Released" ? "active" : "";
  const lockIcon = locked > 0 ? "🔒" : "🔓";
  const stateLabel = t("eth.re.state." + state);

  el.innerHTML = `
    <div class="re-diagram state-${state.toLowerCase()}">
      <div class="re-top">
        <div class="re-actor inspector ${inspectorActive}">
          <div class="ra-emoji">🔎</div>
          <div class="ra-name">${esc(inspector)}</div>
          <div class="ra-role">${t("eth.re.role.inspector")}</div>
        </div>
        <div class="re-arrow down ${confirmArrow}"><span class="lbl">${t("eth.re.flow.confirm")}</span></div>
      </div>
      <div class="re-mid">
        <div class="re-actor buyer ${buyerActive}">
          <div class="ra-emoji">🧑‍💼</div>
          <div class="ra-name">${esc(buyer)}</div>
          <div class="ra-role">${t("eth.re.role.buyer")}</div>
        </div>
        <div class="re-arrow right ${depositArrow}"><span class="lbl">${t("eth.re.flow.deposit")}</span></div>
        <div class="re-vault">
          <div class="rv-title">Escrow${c ? " · " + esc(c.name) : ""}</div>
          <div class="rv-lock">${lockIcon} ${locked.toFixed(4)} <small>ETH</small></div>
          <div class="rv-state badge-${state.toLowerCase()}">${stateLabel}</div>
          <div class="rv-price mono">${t("eth.re.priceLbl")}: ${esc(priceStr)}</div>
          ${c && c.storage.inspectorFee ? `<div class="rv-price mono">${t("eth.re.feeLbl")}: ${esc(c.storage.inspectorFee)}</div>` : ""}
        </div>
        <div class="re-arrow right ${releaseArrow}"><span class="lbl">${t("eth.re.flow.release")}</span></div>
        <div class="re-actor seller ${sellerActive}">
          <div class="ra-emoji">🏠</div>
          <div class="ra-name">${esc(seller)}</div>
          <div class="ra-role">${t("eth.re.role.seller")}</div>
        </div>
      </div>
    </div>`;
}

function renderReLedger() {
  const el = $("ethReLedger");
  if (!el || !eth) return;
  const seller = ($("ethReSeller")?.value || "Bob").trim();
  const buyer = ($("ethReBuyer")?.value || "Alice").trim();
  const inspector = ($("ethReInspector")?.value || "Carol").trim();
  const by = Object.fromEntries(JSON.parse(eth.accounts_snapshot()).accounts.map((a) => [a.label, a]));
  const acctChip = (label, role) => {
    const a = by[label];
    if (!a) return "";
    return chipHtml({
      label,
      bal: Number(a.balanceEth),
      roleText: t("eth.re.role." + role),
      roleCls: role,
      nonce: a.nonce,
    });
  };
  const rows = [acctChip(buyer, "buyer"), acctChip(seller, "seller"), acctChip(inspector, "inspector")];
  const c = reContract();
  if (c)
    rows.push(
      chipHtml({
        label: c.name,
        bal: Number(c.balanceEth),
        roleText: t("eth.re.role.contract"),
        roleCls: "contract",
        lock: Number(c.balanceEth) > 0,
      })
    );
  el.innerHTML = rows.join("");
}

function renderReBlocks() {
  const el = $("ethReBlocks");
  if (!el) return;
  if (!reBlocks.length) {
    el.innerHTML = `<div class="empty">${t("eth.re.blocksEmpty")}</div>`;
    return;
  }
  el.innerHTML = reBlocks
    .map((b, i) => {
      const prev = i > 0 ? reBlocks[i - 1].stateRoot : null;
      const changed = prev && prev !== b.stateRoot;
      const sr = `${b.stateRoot.slice(0, 10)}…${b.stateRoot.slice(-6)}`;
      if (b.genesis) {
        return `<div class="re-block genesis"><div class="bh">#0 · genesis</div><div class="btx muted">${t("eth.re.genesisTx")}</div><div class="bsr mono">stateRoot ${sr}</div></div>`;
      }
      const tx = b.tx;
      const cls = tx.reverted ? "reverted" : "ok";
      const line = tx.reverted ? `⛔ ${esc(tx.label)} — revert` : esc(tx.label);
      const badge = tx.reverted
        ? `<span class="sr-same">${t("eth.re.srSame")}</span>`
        : changed
        ? `<span class="sr-diff">${t("eth.re.srDiff")}</span>`
        : "";
      return `<div class="re-block ${cls}"><div class="bh">#${b.no}</div><div class="btx">${line} <span class="gas mono">gas ${Number(tx.gas || 0).toLocaleString()}</span></div><div class="bsr mono">stateRoot ${sr} ${badge}</div></div>`;
    })
    .join("");
  el.scrollTop = el.scrollHeight;
}

function updateReButtons() {
  const state = reState();
  const set = (id, en) => {
    const b = $(id);
    if (b) b.disabled = !en;
  };
  set("ethReDeployBtn", state === "None");
  set("ethReDepositBtn", state === "Listed");
  set("ethReConfirmBtn", state === "Funded");
  set("ethReReleaseBtn", state === "Confirmed");
  set("ethReRefundBtn", state === "Listed" || state === "Funded");
}

function updateReHint() {
  const el = $("ethReHint");
  if (!el) return;
  const map = {
    None: "eth.re.hintStart",
    Listed: "eth.re.hintListed",
    Funded: "eth.re.hintFunded",
    Confirmed: "eth.re.hintConfirmed",
    Released: "eth.re.hintReleased",
    Refunded: "eth.re.hintRefunded",
  };
  el.innerHTML = t(map[reState()] || "eth.re.hintStart");
}

function renderReTab() {
  const codeEl = $("ethReCode");
  if (codeEl) codeEl.innerHTML = renderSolidity("escrow", reHighlight);
  renderReStage();
  renderReLedger();
  renderStorage("ethReStorage", reContract());
  renderEvents("ethReEvents", reContract()?.address || "__none__");
  renderReBlocks();
  updateReButtons();
  updateReHint();
}

function reDeploy() {
  if (!eth || reState() !== "None") return;
  const seller = ($("ethReSeller")?.value || "Bob").trim();
  const buyer = ($("ethReBuyer")?.value || "Alice").trim();
  const inspector = ($("ethReInspector")?.value || "Carol").trim();
  const price = Number($("ethRePrice")?.value) || 5;
  const feeRaw = $("ethReFee")?.value;
  const inspectorFeeEth = feeRaw === "" || feeRaw == null ? price * 0.02 : Number(feeRaw) || 0;
  const name = ($("ethReName")?.value || "Property").trim();
  const args = JSON.stringify({ priceEth: price, name, buyer, inspector, inspectorFeeEth });
  const r = JSON.parse(eth.deploy_contract("escrow", seller, args, 0, DEFAULT_TIP));
  if (r.ok) {
    reAddr = r.address;
    reHighlight = "constructor";
    pushReBlock({
      who: seller,
      func: "deploy",
      label: `deploy Escrow(${price} ETH, fee ${inspectorFeeEth} ETH) · by ${seller}`,
      gas: r.gas_used,
      reverted: false,
    });
    statusMsg("ethReMsg", t("eth.re.msgDeployed", { addr: shortAddr(r.address), nonce: r.nonce }), true);
    renderReceipt("ethReReceipt", r);
  } else {
    statusMsg("ethReMsg", r.error, false);
  }
  renderReTab();
  renderAccounts();
  pushLogs("ethReLog");
}

function reCall(func, caller, valueEth) {
  if (!reAddr) return;
  const r = JSON.parse(eth.call_contract(reAddr, func, "{}", caller, valueEth || 0, DEFAULT_TIP));
  reHighlight = func;
  pushReBlock({
    who: caller,
    func,
    label: `${func}() · by ${caller}${valueEth ? ` · ${valueEth} ETH` : ""}`,
    gas: r.gas_used,
    reverted: !!r.reverted,
  });
  renderReceipt("ethReReceipt", r);
  statusMsg("ethReMsg", r.ok ? "" : r.error || "", r.ok);
  renderReTab();
  renderAccounts();
  pushLogs("ethReLog");
}

function resetRe() {
  reAddr = null;
  reHighlight = null;
  reBlockNo = 0;
  reBlocks = [{ no: 0, genesis: true, stateRoot: computeStateRoot() }];
  statusMsg("ethReMsg", "", true);
  renderReceipt("ethReReceipt", null);
  renderReTab();
}

function wireReTab() {
  if (!reBlocks.length) reBlocks = [{ no: 0, genesis: true, stateRoot: computeStateRoot() }];
  $("ethReDeployBtn")?.addEventListener("click", reDeploy);
  $("ethReDepositBtn")?.addEventListener("click", () =>
    reCall("deposit", ($("ethReBuyer")?.value || "Alice").trim(), rePriceEth())
  );
  $("ethReConfirmBtn")?.addEventListener("click", () =>
    reCall("confirm", ($("ethReInspector")?.value || "Carol").trim(), 0)
  );
  $("ethReReleaseBtn")?.addEventListener("click", () =>
    reCall("release", ($("ethReBuyer")?.value || "Alice").trim(), 0)
  );
  $("ethReRefundBtn")?.addEventListener("click", () =>
    reCall("refund", ($("ethReBuyer")?.value || "Alice").trim(), 0)
  );
  $("ethReReset")?.addEventListener("click", resetRe);
}

// ---------- 8 · EVM 실행기 ----------

let evmRunFn = null;
let evmResult = null;
let evmStepIdx = 0;
/** 프로그램 바꿔도 유지되는 stateRoot 커밋 로그 (git log 비유) */
let evmCommits = [];
let evmLiveRoot = null;
const EVM_GAS_LIMIT = 100000;

const EVM_SOL = {
  store: "// x 는 storage slot 0 (영구)\nfunction set(uint256 v) external {\n    x = v + 1;\n}",
  arith: "// 순수 계산 — 스토리지·입력 없음\nuint256 result = (3 + 4) * 2;  // = 14",
  escrow: `// 7번 탭 Escrow 의 happy path 를 opcode 로 요약한 교육용 버전
// (권한 검사·msg.value·수수료 분배는 생략 — SSTORE 로 상태만 보여줌)
// slot0 = state  0 Listed → 1 Funded → 2 Confirmed → 3 Released
// slot1 = price   slot2 = locked
function demoEscrow(uint256 price) external {
    // list
    price_ = price;   state = Listed;   locked = 0;
    // deposit
    state = Funded;   locked = price;
    // confirm
    state = Confirmed;
    // release
    state = Released; locked = 0;
}`,
};

const EVM_STATE_NAMES = ["Listed", "Funded", "Confirmed", "Released"];

function evmProgram() {
  return $("evmProgram")?.value || "store";
}
function evmUsesCalldata() {
  const p = evmProgram();
  return p === "store" || p === "escrow";
}

/** escrow 슬롯을 사람이 읽게 (prog 지정 가능 — 히스토리 표시용) */
function evmSlotLabel(slotDec, prog = evmProgram()) {
  if (prog !== "escrow") return `slot ${slotDec}`;
  if (slotDec === "0") return "slot 0 · state";
  if (slotDec === "1") return "slot 1 · price";
  if (slotDec === "2") return "slot 2 · locked";
  return `slot ${slotDec}`;
}
function evmSlotValue(slotDec, valHex, prog = evmProgram()) {
  const n = evmDec(valHex);
  if (prog === "escrow" && slotDec === "0") {
    const name = EVM_STATE_NAMES[Number(n)] || n;
    return `${name} (${n})`;
  }
  return n;
}

/** 64-hex 워드 → 10진 문자열 (BigInt) */
function evmDec(hex) {
  try {
    return BigInt("0x" + hex).toString(10);
  } catch {
    return "0";
  }
}
/** 앞 0 제거한 짧은 hex */
function evmShortHex(hex) {
  const trimmed = String(hex).replace(/^0+/, "") || "0";
  return "0x" + trimmed;
}

function evmShortRoot(root) {
  const h = String(root || "").replace(/^0x/, "");
  if (h.length < 12) return root || "—";
  return "0x" + h.slice(0, 8) + "…" + h.slice(-6);
}

/** storage 맵 → 교육용 stateRoot (keccak of sorted slots) */
function evmStateRoot(storage) {
  if (!ethKeccakFn) return "0x" + "0".repeat(64);
  const keys = Object.keys(storage || {}).sort();
  const body = keys.length
    ? keys.map((k) => `${k}=${storage[k]}`).join("\n")
    : "(empty)";
  return "0x" + ethKeccakFn(body);
}

function evmStorageSummary(storage, prog = evmProgram()) {
  const keys = Object.keys(storage || {}).sort();
  if (!keys.length) return t("eth.evm.emptyStorage");
  return keys
    .map((k) => {
      const sd = evmDec(k);
      return `${evmSlotLabel(sd, prog)} = ${evmSlotValue(sd, storage[k], prog)}`;
    })
    .join(", ");
}

/** storage가 바뀌면(또는 genesis) 커밋 히스토리에 push — 프로그램 전환해도 유지 */
function evmMaybeCommit(step, idx) {
  const storage = step.storage || {};
  const root = evmStateRoot(storage);
  evmLiveRoot = root;

  const shouldCommit =
    evmCommits.length === 0 ||
    !!step.changed_slot ||
    (step.halted && !step.reverted && evmCommits[0]?.root !== root);

  if (!shouldCommit) return root;

  // 같은 root가 맨 위에 이미 있으면 중복 push 안 함
  if (evmCommits[0]?.root === root) return root;

  const prog = evmProgram();
  const v = ($("evmCalldata")?.value ?? "").toString();
  let label;
  if (evmCommits.length === 0 && Object.keys(storage).length === 0) {
    label = t("eth.evm.commitGenesis");
  } else if (step.changed_slot != null) {
    const sd = evmDec(step.changed_slot);
    const vh = storage[step.changed_slot] || "0".repeat(64);
    label = t("eth.evm.commitSstore", {
      slot: evmSlotLabel(sd, prog),
      val: evmSlotValue(sd, vh, prog),
    });
  } else if (step.halted) {
    label = t("eth.evm.commitStop", { prog });
  } else {
    label = t("eth.evm.commitSnap");
  }

  evmCommits.unshift({
    root,
    storage: { ...storage },
    label,
    program: prog,
    v: prog === "store" || prog === "escrow" ? v : null,
    op: step.op || "INIT",
    step: idx,
    at: Date.now(),
  });
  // 너무 길면 앞(최신) 24개만
  if (evmCommits.length > 24) evmCommits.length = 24;
  return root;
}

function renderEvmGit(step, idx) {
  const storage = step?.storage || {};
  const root = evmMaybeCommit(step || { storage: {} }, idx || 0);
  const prev = evmCommits.find((c) => c.root !== root);
  const changed = prev && prev.root !== root;

  const treeEl = $("evmGitTree");
  if (treeEl) {
    const keys = Object.keys(storage).sort();
    if (!keys.length) {
      treeEl.innerHTML = `<div class="empty">${t("eth.evm.emptyStorage")}</div>`;
    } else {
      treeEl.innerHTML = keys
        .map((k) => {
          const ch = step?.changed_slot === k ? "changed" : "";
          const sd = evmDec(k);
          return `<div class="egt-row ${ch}"><span class="mono">${esc(
            evmSlotLabel(sd)
          )}</span><span class="egt-val">${esc(evmSlotValue(sd, storage[k]))} <span class="mono muted">${esc(
            evmShortHex(storage[k])
          )}</span></span></div>`;
        })
        .join("");
    }
  }

  const rootEl = $("evmGitRoot");
  if (rootEl) rootEl.textContent = root;

  const noteEl = $("evmGitRootNote");
  if (noteEl) {
    if (!prev) noteEl.textContent = t("eth.evm.gitRootFirst");
    else if (changed) noteEl.innerHTML = t("eth.evm.gitRootChanged", { prev: evmShortRoot(prev.root) });
    else noteEl.textContent = t("eth.evm.gitRootSame");
  }

  const listEl = $("evmCommits");
  if (listEl) {
    if (!evmCommits.length) {
      listEl.innerHTML = `<div class="empty">${t("eth.evm.gitEmpty")}</div>`;
    } else {
      listEl.innerHTML = evmCommits
        .map((c, i) => {
          const head = i === 0 ? `<span class="ec-head">HEAD</span>` : "";
          const active = c.root === root ? "active" : "";
          const meta =
            c.program === "store" && c.v != null
              ? `set(v=${esc(c.v)})`
              : c.program === "escrow" && c.v != null
              ? `escrow(price=${esc(c.v)})`
              : esc(c.program);
          return `<div class="evm-commit ${active}">
            <div class="ec-dot"></div>
            <div class="ec-body">
              <div class="ec-top">${head}<span class="ec-hash mono">${esc(
            evmShortRoot(c.root)
          )}</span><span class="ec-meta muted">${meta}</span></div>
              <div class="ec-msg">${esc(c.label)}</div>
              <div class="ec-tree muted mono">${esc(evmStorageSummary(c.storage, c.program))}</div>
            </div>
          </div>`;
        })
        .join("");
    }
  }
}

function runEvm(resetIdx = true) {
  if (!evmRunFn) return;
  const prog = evmProgram();
  const v = String(Math.max(0, Math.floor(Number($("evmCalldata")?.value) || 0)));
  try {
    // wasm-bindgen 은 u64 를 JS BigInt 로 받는다 (number 넘기면 TypeError)
    evmResult = JSON.parse(evmRunFn(prog, v, BigInt(EVM_GAS_LIMIT)));
  } catch (e) {
    console.error("[evm_run]", e);
    evmResult = null;
    const exEl = $("evmExplain");
    if (exEl)
      exEl.innerHTML = `<div class="evm-step-note bad"><div class="esn-msg">EVM 실행 실패: ${esc(
        e?.message || String(e)
      )}</div></div>`;
    return;
  }
  const n = evmResult?.steps?.length || 1;
  evmStepIdx = resetIdx ? 0 : Math.min(evmStepIdx, n - 1);
  // 히스토리가 비어 있으면 genesis 커밋 확보
  if (!evmCommits.length) {
    evmMaybeCommit({ storage: {}, op: "INIT" }, 0);
  }
  renderEvm();
}

function evmStepExplain(step, idx) {
  if (idx === 0) return `<div class="evm-step-note"><div class="esn-msg">${t("eth.evm.exInit")}</div></div>`;
  const op = step.op;
  let msg;
  switch (op) {
    case "PUSH1":
      msg = t("eth.evm.exPush", { v: step.arg || "" });
      break;
    case "CALLDATALOAD":
      msg = t("eth.evm.exCalldata");
      break;
    case "ADD":
      msg = t("eth.evm.exAdd");
      break;
    case "MUL":
      msg = t("eth.evm.exMul");
      break;
    case "SUB":
      msg = t("eth.evm.exSub");
      break;
    case "SSTORE":
      if (evmProgram() === "escrow" && step.changed_slot != null) {
        const sd = evmDec(step.changed_slot);
        const vh = (step.storage && step.storage[step.changed_slot]) || "0".repeat(64);
        msg = t("eth.evm.exSstoreEscrow", {
          slot: evmSlotLabel(sd),
          val: evmSlotValue(sd, vh),
        });
      } else {
        msg = t("eth.evm.exSstore");
      }
      break;
    case "SLOAD":
      msg = t("eth.evm.exSload");
      break;
    case "MSTORE":
      msg = t("eth.evm.exMstore");
      break;
    case "STOP":
      msg = t("eth.evm.exStop");
      break;
    default:
      msg = esc(op);
  }
  let cls = step.halted ? "good" : "";
  if (step.reverted) {
    cls = "bad";
    msg = t("eth.evm.exRevert", { reason: esc(step.revert_reason || "") });
  }
  return `<div class="evm-step-note ${cls}"><span class="esn-op mono">${esc(op)}</span><span class="esn-gas">−${step.gas_cost} gas</span><div class="esn-msg">${msg}</div></div>`;
}

function renderEvm() {
  const cdField = $("evmCalldataField");
  if (cdField) cdField.style.display = evmUsesCalldata() ? "" : "none";
  const cdLbl = $("evmCalldataLbl");
  if (cdLbl) {
    cdLbl.textContent =
      evmProgram() === "escrow" ? t("eth.evm.calldataPrice") : t("eth.evm.calldata");
  }

  const solEl = $("evmSol");
  if (solEl)
    solEl.innerHTML = `<div class="evm-sol-title">Solidity</div><pre class="eth-solidity">${esc(
      EVM_SOL[evmProgram()] || ""
    )}</pre>`;

  if (!evmResult) return;
  const steps = evmResult.steps || [];
  const idx = Math.max(0, Math.min(evmStepIdx, steps.length - 1));
  const step = steps[idx];

  // 바이트코드 + PC 하이라이트
  const hlPc = idx === 0 ? evmResult.disasm[0]?.pc : step.pc;
  const bcEl = $("evmBytecode");
  if (bcEl) {
    bcEl.innerHTML = evmResult.disasm
      .map((d) => {
        const active = d.pc === hlPc ? "active" : "";
        const arg = d.arg ? ` <span class="ba">${esc(d.arg)}</span>` : "";
        return `<div class="evm-op ${active}"><span class="bpc">${String(d.pc).padStart(
          2,
          "0"
        )}</span><span class="bhex mono">${d.op_hex}</span><span class="bop">${esc(
          d.op
        )}${arg}</span><span class="bgas">${d.gas}</span></div>`;
      })
      .join("");
    const act = bcEl.querySelector(".evm-op.active");
    if (act) act.scrollIntoView({ block: "nearest" });
  }

  // 스택 (top ↑)
  const stEl = $("evmStack");
  if (stEl) {
    if (!step.stack.length) stEl.innerHTML = `<div class="empty">${t("eth.evm.emptyStack")}</div>`;
    else
      stEl.innerHTML = step.stack
        .map((h, i) => {
          const tag = i === 0 ? `<span class="stag">top</span>` : "";
          return `<div class="evm-word">${tag}<span class="wd">${evmDec(
            h
          )}</span><span class="wh mono">${evmShortHex(h)}</span></div>`;
        })
        .join("");
  }

  // 메모리
  const memEl = $("evmMemory");
  if (memEl)
    memEl.innerHTML = step.memory
      ? `<span class="mono">0x${esc(step.memory)}</span>`
      : `<div class="empty">${t("eth.evm.emptyMem")}</div>`;

  // 스토리지 (변경 슬롯 하이라이트)
  const storEl = $("evmStorage");
  if (storEl) {
    const keys = Object.keys(step.storage || {});
    if (!keys.length) storEl.innerHTML = `<div class="empty">${t("eth.evm.emptyStorage")}</div>`;
    else
      storEl.innerHTML = keys
        .map((k) => {
          const changed = step.changed_slot === k ? "changed" : "";
          const sd = evmDec(k);
          return `<div class="evm-slot ${changed}"><span class="sk mono">${esc(
            evmSlotLabel(sd)
          )}</span><span class="sv">${esc(evmSlotValue(sd, step.storage[k]))} <span class="mono">(${esc(
            evmShortHex(step.storage[k])
          )})</span></span></div>`;
        })
        .join("");
  }

  // gas
  const gasEl = $("evmGas");
  if (gasEl) {
    const used = evmResult.gas_limit - step.gas_left;
    const pct = Math.min(100, (used / evmResult.gas_limit) * 100);
    gasEl.innerHTML = `<div class="evm-gasbar"><div class="evm-gasfill" style="width:${pct}%"></div></div><div class="evm-gasnums"><span>${t(
      "eth.evm.gasUsed"
    )} <b>${used.toLocaleString()}</b></span><span>${t(
      "eth.evm.gasLeft"
    )} ${step.gas_left.toLocaleString()}</span></div>`;
  }

  // 현재 스텝 설명
  const exEl = $("evmExplain");
  if (exEl) exEl.innerHTML = evmStepExplain(step, idx);

  // storage → stateRoot (git 커밋 비유) — 프로그램 바꿔도 히스토리 유지
  renderEvmGit(step, idx);

  // 버튼 상태 + 진행 표시
  const atStart = idx <= 0;
  const atEnd = idx >= steps.length - 1;
  if ($("evmStepBack")) $("evmStepBack").disabled = atStart;
  if ($("evmStep")) $("evmStep").disabled = atEnd;
  if ($("evmRunAll")) $("evmRunAll").disabled = atEnd;
  const stepBtn = $("evmStep");
  if (stepBtn) stepBtn.textContent = `${t("eth.evm.step")} (${idx}/${steps.length - 1})`;
}

function renderEvmTab() {
  if (!evmResult) runEvm(true);
  else renderEvm();
}

function wireEvmTab() {
  $("evmProgram")?.addEventListener("change", () => {
    const inp = $("evmCalldata");
    if (inp) {
      if (evmProgram() === "escrow" && (inp.value === "41" || inp.value === "")) inp.value = "5";
      if (evmProgram() === "store" && (inp.value === "5" || inp.value === "")) inp.value = "41";
    }
    runEvm(true);
  });
  // calldata 입력 중엔 매 글자마다 리셋되면 답답하니 change(포커스 아웃/엔터)에서만 재실행
  $("evmCalldata")?.addEventListener("change", () => runEvm(true));
  $("evmStep")?.addEventListener("click", () => {
    if (evmResult && evmStepIdx < evmResult.steps.length - 1) {
      evmStepIdx++;
      renderEvm();
    }
  });
  $("evmStepBack")?.addEventListener("click", () => {
    if (evmResult && evmStepIdx > 0) {
      evmStepIdx--;
      renderEvm();
    }
  });
  $("evmRunAll")?.addEventListener("click", () => {
    if (evmResult) {
      // 중간 SSTORE 커밋을 빠짐없이 찍으려면 스텝을 순회
      const last = evmResult.steps.length - 1;
      for (let i = evmStepIdx + 1; i <= last; i++) {
        evmStepIdx = i;
        const s = evmResult.steps[i];
        if (s) evmMaybeCommit(s, i);
      }
      renderEvm();
    }
  });
  $("evmReset")?.addEventListener("click", () => {
    // 스텝만 처음으로 — 커밋 히스토리는 유지
    evmStepIdx = 0;
    renderEvm();
  });
  $("evmClearHist")?.addEventListener("click", () => {
    evmCommits = [];
    evmMaybeCommit({ storage: {}, op: "INIT" }, 0);
    renderEvm();
  });
}

// ---------- 전체 ----------

function renderAll() {
  renderAccounts();
  renderNonceInfo();
  renderScTab();
  renderTokTab();
  renderOracleTab();
  renderValidators();
  renderPos();
  renderReTab();
  renderEvmTab();
  updateKeccakTab();
}

/** WASM 로드 후 호출 */
export function setupEth(WasmEth, keccak256, addressFromLabel, evmRun) {
  ethKeccakFn = keccak256;
  ethAddrFn = addressFromLabel;
  evmRunFn = evmRun;
  eth = new WasmEth();
  wireKeccakTab();
  wireAccountTab();
  wireScTab();
  wireTokTab();
  wireOracleTab();
  wirePosTab();
  wireReTab();
  wireEvmTab();
  wireMerkleTab(ethKeccakFn);
  renderAll();
  document.addEventListener("i18n:changed", () => {
    applyI18n();
    renderAll();
  });
}

export function refreshEth() {
  if (eth) renderAll();
}
