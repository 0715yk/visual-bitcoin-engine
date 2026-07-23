// ============================================================
// eth-merkle.js — 머클 증명 시뮬레이터 (탭 9)
// 잎(계정)에서 stateRoot까지 해시를 타고 올라가는 과정을 애니메이션으로 보여준다.
// ============================================================

import { t } from "../i18n.js";

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let keccak = null; // (string) => 64-hex (0x 없음)
let running = false;
let selected = 0;

const ACCOUNTS = [
  { name: "Alice", bal: 120 },
  { name: "Bob", bal: 75 },
  { name: "Carol", bal: 40 },
  { name: "Dave", bal: 200 },
];
const LIE_BAL = 9999;

// 노드 계산값 캐시 (참값)
let tree = null;

const short = (h) => (h ? "0x" + h.slice(0, 8) + "…" + h.slice(-4) : "—");
const combine = (a, b) => keccak(a + b);
const leafHash = (name, bal) => keccak(`${name}:${bal}`);
const pos = (side) => (side === "right" ? t("eth.mk.posR") : t("eth.mk.posL"));

function buildTree() {
  const l = ACCOUNTS.map((a) => leafHash(a.name, a.bal));
  const n01 = combine(l[0], l[1]);
  const n23 = combine(l[2], l[3]);
  const root = combine(n01, n23);
  tree = { l, n01, n23, root };
}

// 선택한 잎 index i 의 검증 경로를 계산
function proofPath(i, balOverride) {
  const acct = ACCOUNTS[i];
  const bal = balOverride == null ? acct.bal : balOverride;
  const startLeaf = leafHash(acct.name, bal);

  const leafSibIdx = i % 2 === 0 ? i + 1 : i - 1;
  const leafSibPos = i % 2 === 0 ? "right" : "left"; // 형제가 오른쪽/왼쪽
  const p = Math.floor(i / 2); // 0 → n01, 1 → n23
  const midSibId = p === 0 ? "n23" : "n01";
  const midSibPos = p === 0 ? "right" : "left";

  // 레벨0 결합
  const leafSib = tree.l[leafSibIdx];
  const parent =
    leafSibPos === "right" ? combine(startLeaf, leafSib) : combine(leafSib, startLeaf);
  // 레벨1 결합
  const midSib = midSibId === "n23" ? tree.n23 : tree.n01;
  const computedRoot =
    midSibPos === "right" ? combine(parent, midSib) : combine(midSib, parent);

  return {
    startLeaf,
    leafSibIdx,
    leafSibPos,
    leafSib,
    parentId: p === 0 ? "n01" : "n23",
    parent,
    midSibId,
    midSibPos,
    midSib,
    computedRoot,
  };
}

// ---------- 렌더 ----------

function nodeHtml(id, lbl, hash, cls = "", sub = "") {
  return `<div class="mk-node ${cls}" id="mkn-${id}">
    <span class="mkn-lbl">${lbl}</span>
    ${sub ? `<span class="mkn-sub">${sub}</span>` : ""}
    <span class="mkn-hash mono">${short(hash)}</span>
  </div>`;
}

function renderTree() {
  const el = $("mkTree");
  if (!el) return;
  const leaf = (i, id, lbl) =>
    nodeHtml(id, `${lbl} · ${ACCOUNTS[i].name}`, tree.l[i], "leaf", `${ACCOUNTS[i].bal} ETH`);
  el.innerHTML = `
    <div class="mk-legend">${t("eth.mk.legend")}</div>

    <div class="mk-row">
      ${nodeHtml("root", "stateRoot", tree.root, "root", "= keccak( N01 ‖ N23 )")}
    </div>
    <div class="mk-up">${t("eth.mk.up1")}</div>
    <div class="mk-row">
      <div class="mk-group">
        <div class="mk-group-hd">${t("eth.mk.grpRoot")}</div>
        <div class="mk-group-nodes">
          ${nodeHtml("n01", "N01", tree.n01, "", "= keccak( L0 ‖ L1 )")}
          ${nodeHtml("n23", "N23", tree.n23, "", "= keccak( L2 ‖ L3 )")}
        </div>
      </div>
    </div>
    <div class="mk-up">${t("eth.mk.up2")}</div>
    <div class="mk-row">
      <div class="mk-group">
        <div class="mk-group-hd">${t("eth.mk.grpN01")}</div>
        <div class="mk-group-nodes">${leaf(0, "l0", "L0")}${leaf(1, "l1", "L1")}</div>
      </div>
      <div class="mk-group">
        <div class="mk-group-hd">${t("eth.mk.grpN23")}</div>
        <div class="mk-group-nodes">${leaf(2, "l2", "L2")}${leaf(3, "l3", "L3")}</div>
      </div>
    </div>`;
}

function renderAccts() {
  const el = $("mkAccts");
  if (!el) return;
  el.innerHTML = ACCOUNTS.map(
    (a, i) =>
      `<button class="mk-chip ${i === selected ? "on" : ""}" data-i="${i}">${t("eth.mk.prove", {
        name: a.name,
      })}</button>`
  ).join("");
}

function setHash(id, hash) {
  const n = $(`mkn-${id}`);
  if (n) n.querySelector(".mkn-hash").textContent = short(hash);
}
function cls(id, add, remove) {
  const n = $(`mkn-${id}`);
  if (!n) return;
  if (remove) n.classList.remove(...remove);
  if (add) n.classList.add(...add);
}

function clearFx() {
  document.querySelectorAll("#mkTree .mk-node").forEach((n) =>
    n.classList.remove("mk-active", "mk-path", "mk-sibling", "mk-done", "mk-bad")
  );
  $("mkProof").innerHTML = "";
  $("mkExplain").innerHTML = "";
  $("mkVerdict").innerHTML = "";
  $("mkVerdict").className = "mk-verdict";
}

function reset() {
  buildTree();
  renderTree();
  clearFx();
  cls(`l${selected}`, ["mk-path"]);
}

// ---------- 애니메이션 ----------

async function run() {
  if (running || !keccak) return;
  running = true;
  $("mkRun").disabled = true;
  const lie = $("mkLie").checked;
  const i = selected;
  const acct = ACCOUNTS[i];

  buildTree();
  renderTree();
  clearFx();

  const claimedBal = lie ? LIE_BAL : acct.bal;
  const pp = proofPath(i, claimedBal);

  // 증명 패널 (풀 노드가 보내는 것)
  $("mkProof").innerHTML = `
    <div class="mk-pf-item"><span class="mk-pf-k">${t("eth.mk.claim")}</span><span class="mk-pf-v ${
    lie ? "bad" : ""
  }">${acct.name} = ${claimedBal} ETH${lie ? "  " + t("eth.mk.forged") : ""}</span></div>
    <div class="mk-pf-item"><span class="mk-pf-k">${t("eth.mk.sib1")}</span><span class="mk-pf-v mono">${short(
    pp.leafSib
  )} <em>(${pos(pp.leafSibPos)})</em></span></div>
    <div class="mk-pf-item"><span class="mk-pf-k">${t("eth.mk.sib2")}</span><span class="mk-pf-v mono">${short(
    pp.midSib
  )} <em>(${pos(pp.midSibPos)})</em></span></div>`;

  const explain = $("mkExplain");
  const say = (html) => (explain.innerHTML = html);

  // 1) 계정 선택 강조
  cls(`l${i}`, ["mk-active"]);
  say(t("eth.mk.step1", { name: acct.name, bal: claimedBal, hash: short(pp.startLeaf) }));
  await sleep(1100);

  // lie면 leaf부터 참값과 달라짐 표시
  if (lie) {
    setHash(`l${i}`, pp.startLeaf);
    cls(`l${i}`, ["mk-bad"], ["mk-active"]);
  } else {
    cls(`l${i}`, ["mk-done"], ["mk-active"]);
  }
  cls(`l${i}`, ["mk-path"]);

  // 2) 형제 잎 + 부모 계산
  cls(`l${pp.leafSibIdx}`, ["mk-sibling"]);
  say(
    t("eth.mk.step2", {
      sib: short(pp.leafSib),
      pos: pos(pp.leafSibPos),
      parent: pp.parentId.toUpperCase(),
    })
  );
  cls(pp.parentId, ["mk-active"]);
  await sleep(1200);
  setHash(pp.parentId, pp.parent);
  cls(pp.parentId, [lie ? "mk-bad" : "mk-done", "mk-path"], ["mk-active"]);

  // 3) 형제 중간노드 + 루트 계산
  cls(pp.midSibId, ["mk-sibling"]);
  say(t("eth.mk.step3", { sib: short(pp.midSib), pos: pos(pp.midSibPos) }));
  cls("root", ["mk-active"], ["root"]);
  await sleep(1300);
  setHash("root", pp.computedRoot);

  // 4) 헤더의 stateRoot 와 비교
  const ok = pp.computedRoot === tree.root;
  cls("root", [ok ? "mk-done" : "mk-bad", "mk-path"], ["mk-active"]);
  const v = $("mkVerdict");
  if (ok) {
    v.className = "mk-verdict ok";
    v.innerHTML = t("eth.mk.vOk", { root: short(pp.computedRoot) });
    say(t("eth.mk.step4ok"));
  } else {
    v.className = "mk-verdict bad";
    v.innerHTML = t("eth.mk.vBad", { comp: short(pp.computedRoot), header: short(tree.root) });
    say(t("eth.mk.step4bad"));
  }

  running = false;
  $("mkRun").disabled = false;
}

// ---------- 초기화 ----------

export function wireMerkleTab(keccakFn) {
  keccak = keccakFn;
  if (!$("mkTree")) return;
  selected = 0;
  buildTree();
  renderAccts();
  renderTree();
  cls(`l${selected}`, ["mk-path"]);

  $("mkAccts")?.addEventListener("click", (e) => {
    const b = e.target.closest(".mk-chip");
    if (!b || running) return;
    selected = Number(b.dataset.i);
    document.querySelectorAll("#mkAccts .mk-chip").forEach((c) => c.classList.toggle("on", c === b));
    renderTree();
    clearFx();
    cls(`l${selected}`, ["mk-path"]); // 고른 잎 미리 표시
  });
  $("mkRun")?.addEventListener("click", run);
  $("mkReset")?.addEventListener("click", () => {
    if (running) return;
    reset();
  });
  $("mkLie")?.addEventListener("change", () => {
    if (running) return;
    renderTree();
    clearFx();
    cls(`l${selected}`, ["mk-path"]);
  });

  // 언어 전환 시 동적 트리·칩·증명 문구를 새 언어로 다시 그린다.
  document.addEventListener("i18n:changed", () => {
    if (running) return;
    renderAccts();
    renderTree();
    clearFx();
    cls(`l${selected}`, ["mk-path"]);
  });
}
