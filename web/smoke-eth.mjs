// Node smoke test: WasmEth 컨트랙트 플로우 검증 (브라우저 없이)
import fs from "node:fs";
import init, { WasmEth } from "./pkg/visual_bitcoin_engine.js";

const wasm = fs.readFileSync(new URL("./pkg/visual_bitcoin_engine_bg.wasm", import.meta.url));
await init(wasm);

const eth = new WasmEth();
const P = (s) => JSON.parse(s);
let fail = 0;
const check = (name, cond, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
  if (!cond) fail++;
};

// 제네시스: SAND erc20 + pricefeed 존재
let cs = P(eth.contracts_snapshot());
check("genesis contracts", cs.length === 2, cs.map((c) => c.kind).join(","));
const sand = cs.find((c) => c.kind === "erc20");
check("SAND name", sand.name === "SAND");
check("SAND balances", sand.storage["balance[Alice]"] === "1000.00" && sand.storage["balance[Bob]"] === "200.00");

// ETH transfer
let r = P(eth.transfer("Alice", "Bob", 1, 5));
check("transfer ok", r.ok && r.tip_eth > 0 && r.base_fee_burned_eth > 0);

// vending 배포 + buy + 남 withdraw revert + owner withdraw
r = P(eth.deploy_contract("vending", "Alice", JSON.stringify({ priceEth: 0.5, stock: 2, name: "SnackMachine" }), 0, 2));
check("deploy vending", r.ok, r.address);
const vend = r.address;
r = P(eth.call_contract(vend, "buy", "{}", "Bob", 0.5, 2));
check("buy ok", r.ok && r.events.length === 1 && r.events[0].name === "Purchased");
r = P(eth.call_contract(vend, "buy", "{}", "Bob", 0.1, 2));
check("underpay reverts but burns gas", !r.ok && r.reverted && r.gas_used > 0 && r.base_fee_burned_eth > 0);
r = P(eth.call_contract(vend, "withdraw", "{}", "Bob", 0, 2));
check("non-owner withdraw reverts", !r.ok && r.reverted);
const aliceBefore = P(eth.accounts_snapshot()).accounts.find((a) => a.label === "Alice").balanceEth;
r = P(eth.call_contract(vend, "withdraw", "{}", "Alice", 0, 2));
const aliceAfter = P(eth.accounts_snapshot()).accounts.find((a) => a.label === "Alice").balanceEth;
check("owner withdraw pays out", r.ok && aliceAfter > aliceBefore, `${aliceBefore} -> ${aliceAfter}`);

// ERC-20 transfer + 실제 topic0
r = P(eth.call_contract(sand.address, "transfer", JSON.stringify({ to: "Bob", amount: 50 }), "Alice", 0, 2));
check("erc20 transfer", r.ok);
check("real Transfer topic0", r.events[0].topic0 === "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");

// oracle: 3노드 report → median, 비 oracle 거절
const feed = P(eth.contracts_snapshot()).find((c) => c.kind === "pricefeed");
for (const [n, p] of [["Binance", 3100], ["Bybit", 2900], ["Coinbase", 2950]]) {
  r = P(eth.call_contract(feed.address, "report", JSON.stringify({ price: p }), n, 0, 0));
  check(`report ${n}`, r.ok, r.error || r.note);
}
let feedNow = P(eth.contracts_snapshot()).find((c) => c.kind === "pricefeed");
check("median = 2950", feedNow.storage["latestAnswer"] === "2950.00", feedNow.storage["latestAnswer"]);
r = P(eth.call_contract(feed.address, "report", JSON.stringify({ price: 1 }), "Mallory", 0, 0));
check("non-oracle rejected", !r.ok);

// insurance: 배포(1 ETH 풀) → Bob 가입 → settle → 지급
r = P(eth.deploy_contract("insurance", "Alice", JSON.stringify({ feed: feed.address, threshold: 3000, payoutEth: 1, premiumEth: 0.1 }), 1, 2));
check("deploy insurance", r.ok, r.error || r.address);
const ins = r.address;
r = P(eth.call_contract(ins, "buy_policy", "{}", "Bob", 0.1, 2));
check("buy_policy", r.ok, r.error || r.note);
const bobBefore = P(eth.accounts_snapshot()).accounts.find((a) => a.label === "Bob").balanceEth;
r = P(eth.call_contract(ins, "settle", "{}", "Carol", 0, 2));
const bobAfter = P(eth.accounts_snapshot()).accounts.find((a) => a.label === "Bob").balanceEth;
check("settle pays Bob (median 2950 < 3000)", r.ok && bobAfter > bobBefore, `${bobBefore} -> ${bobAfter}`);

// escrow: 부동산 매매 (Bob 매도 → Alice 예치 → Carol 확인 → release)
r = P(eth.deploy_contract("escrow", "Bob", JSON.stringify({ priceEth: 5, name: "Apt-101", buyer: "Alice", inspector: "Carol", inspectorFeeEth: 0.1 }), 0, 2));
check("deploy escrow", r.ok, r.error || r.address);
const esc = r.address;
r = P(eth.call_contract(esc, "confirm", "{}", "Carol", 0, 2));
check("confirm before deposit reverts", !r.ok && r.reverted, r.error);
// Carol 은 잔액이 있지만 지정 매수자가 아님 → 권한 revert 를 검증
r = P(eth.call_contract(esc, "deposit", "{}", "Carol", 5, 2));
check("wrong buyer deposit reverts", !r.ok && r.reverted, r.error);
r = P(eth.call_contract(esc, "deposit", "{}", "Alice", 2, 2));
check("wrong amount deposit reverts", !r.ok && r.reverted, r.error);
r = P(eth.call_contract(esc, "deposit", "{}", "Alice", 5, 2));
check("deposit ok + funds locked", r.ok && r.events[0].name === "Deposited", r.error || r.note);
let escNow = P(eth.contracts_snapshot()).find((c) => c.address === esc);
check("escrow balance = 5 (locked)", Math.abs(escNow.balanceEth - 5) < 1e-9, String(escNow.balanceEth));
check("state Funded", escNow.storage["state"] === "Funded", escNow.storage["state"]);
r = P(eth.call_contract(esc, "release", "{}", "Alice", 0, 2));
check("release before confirm reverts", !r.ok && r.reverted, r.error);
r = P(eth.call_contract(esc, "confirm", "{}", "Alice", 0, 2));
check("non-inspector confirm reverts", !r.ok && r.reverted, r.error);
r = P(eth.call_contract(esc, "confirm", "{}", "Carol", 0, 2));
check("inspector confirm ok", r.ok && r.events[0].name === "Confirmed", r.error || r.note);
const sellerBefore = P(eth.accounts_snapshot()).accounts.find((a) => a.label === "Bob").balanceEth;
const inspBefore = P(eth.accounts_snapshot()).accounts.find((a) => a.label === "Carol").balanceEth;
r = P(eth.call_contract(esc, "release", "{}", "Alice", 0, 2));
const sellerAfter = P(eth.accounts_snapshot()).accounts.find((a) => a.label === "Bob").balanceEth;
const inspAfter = P(eth.accounts_snapshot()).accounts.find((a) => a.label === "Carol").balanceEth;
// 매매가 5 중 확인자 수수료 0.1 은 Carol, 나머지 4.9 는 매도자 Bob
check("release pays seller +4.9 (price - fee)", r.ok && Math.abs(sellerAfter - sellerBefore - 4.9) < 1e-6, `${sellerBefore} -> ${sellerAfter}`);
check("release pays inspector +0.1 fee", Math.abs(inspAfter - inspBefore - 0.1) < 1e-6, `${inspBefore} -> ${inspAfter}`);
escNow = P(eth.contracts_snapshot()).find((c) => c.address === esc);
check("state Released + balance 0", escNow.storage["state"] === "Released" && escNow.balanceEth === 0);

// PoS 여전히 동작
r = P(eth.advance_slot(0));
check("advance_slot", r.ok);
const pos = P(eth.pos_snapshot());
check("pos snapshot", pos.slot >= 1 && Array.isArray(pos.blocks));

// events / logs 스냅샷
check("events snapshot", P(eth.events_snapshot()).length > 5);
check("take_logs drains", P(eth.take_logs()).length > 0);

console.log(fail === 0 ? "\nALL PASS" : `\n${fail} FAILURES`);
process.exit(fail === 0 ? 0 : 1);
