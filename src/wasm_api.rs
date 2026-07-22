// ============================================================
// wasm_api.rs — Rust 엔진을 브라우저(JavaScript)에 노출하는 다리
// ============================================================
// 이 파일은 wasm32 타겟(브라우저)으로 컴파일할 때만 포함된다.
//
// 핵심 아이디어:
//   - 무거운 로직(해시, 채굴, 검증, 잔액)은 전부 "진짜 Rust 엔진"이 처리한다.
//   - JavaScript는 이 함수들을 호출해서 결과(JSON)를 받아 화면에 그리기만 한다.
//   - 즉, 브라우저 안에서 Rust 비트코인 엔진이 그대로 돌아간다.
//
// 데이터는 JSON 문자열로 주고받는다. (JS에서 JSON.parse로 객체로 변환)

use wasm_bindgen::prelude::*;

use crate::block::{sha256_hex, MiningCandidate};
use crate::blockchain::Blockchain;
use crate::config::ChainConfig;
use crate::transaction::Transaction;

// 패닉이 나면 브라우저 콘솔에 Rust 스택트레이스를 보여주도록 설정.
#[wasm_bindgen(start)]
pub fn start() {
    std::panic::set_hook(Box::new(|info| {
        web_panic_log(&info.to_string());
    }));
}

// JS의 console.error로 패닉 메시지를 흘려보낸다.
#[wasm_bindgen(inline_js = "export function web_panic_log(s){ console.error('[wasm panic]', s); }")]
extern "C" {
    fn web_panic_log(s: &str);
}

// ============================================================
// WasmEngine — 브라우저가 다루는 엔진 핸들
// ============================================================
#[wasm_bindgen]
pub struct WasmEngine {
    bc: Blockchain,
    // 현재 "채굴 중인 블록". 채굴이 진행 중일 때만 Some.
    candidate: Option<MiningCandidate>,
}

#[wasm_bindgen]
impl WasmEngine {
    // 설정값을 받아 새 블록체인을 만든다. (제네시스 블록도 여기서 채굴됨)
    #[wasm_bindgen(constructor)]
    pub fn new(
        initial_difficulty: usize,
        adjustment_interval: u64,
        target_time_per_block: u64,
        initial_block_reward: f64,
        halving_interval: u64,
        max_transactions_per_block: usize,
    ) -> WasmEngine {
        let config = ChainConfig::custom(
            initial_difficulty,
            adjustment_interval,
            target_time_per_block,
            initial_block_reward,
            halving_interval,
            max_transactions_per_block,
        );

        WasmEngine {
            bc: Blockchain::new(config),
            candidate: None,
        }
    }

    // 거래를 멤풀에 추가 시도. 승인되면 true, 거부되면 false.
    // (거부 사유 같은 사람이 읽을 메시지는 take_logs로 가져간다)
    pub fn add_transaction(&mut self, from: &str, to: &str, amount: f64) -> bool {
        self.bc.add_transaction(Transaction::new(from, to, amount))
    }

    // 엔진이 쌓아둔 로그를 JSON 배열 문자열로 꺼낸다. (꺼내면 비워짐)
    pub fn take_logs(&mut self) -> String {
        let logs = self.bc.drain_logs();
        serde_json::to_string(&logs).unwrap_or_else(|_| "[]".to_string())
    }

    // ============================================================
    // 채굴 — 준비 / 한 스텝 진행
    // ============================================================

    // 1) 채굴 시작: 멤풀을 모아 채굴 후보 블록을 만든다.
    //    반환 JSON: 채굴 대상 정보 (난이도, 목표, 보상, 거래 수, 해시 입력 등)
    pub fn begin_mine(&mut self, miner: &str) -> String {
        let candidate = self.bc.prepare_mining(miner);

        let reward = candidate
            .transactions
            .first()
            .map(|tx| tx.amount)
            .unwrap_or(0.0);

        let info = serde_json::json!({
            "id": candidate.id,
            "difficulty": candidate.difficulty,
            "target": "0".repeat(candidate.difficulty),
            "reward": reward,
            "txCount": candidate.transactions.len(),
            "previousHash": candidate.previous_hash,
            "timestamp": candidate.timestamp,
            "preimage": candidate.preimage(),
        });

        self.candidate = Some(candidate);
        info.to_string()
    }

    // 2) 채굴 한 스텝: nonce를 batch번 시도한다.
    //    반환 JSON:
    //      { found: bool, mining: bool, nonce, hash, attempts, preimage? }
    //    found=true이면 블록이 완성되어 체인에 확정된다.
    pub fn mine_step(&mut self, batch: u64) -> String {
        let outcome = match self.candidate.as_mut() {
            Some(c) => c.try_batch(batch),
            None => {
                return serde_json::json!({ "found": false, "mining": false }).to_string();
            }
        };

        match outcome {
            Some(block) => {
                let nonce = block.nonce;
                let hash = block.hash.clone();
                self.bc.commit_block(block);
                self.candidate = None;
                serde_json::json!({
                    "found": true,
                    "mining": false,
                    "nonce": nonce,
                    "hash": hash,
                    "attempts": nonce + 1,
                })
                .to_string()
            }
            None => {
                let c = self.candidate.as_ref().unwrap();
                serde_json::json!({
                    "found": false,
                    "mining": true,
                    "nonce": c.nonce,
                    "hash": c.last_hash,
                    "attempts": c.nonce,
                    "preimage": c.preimage(),
                })
                .to_string()
            }
        }
    }

    pub fn is_mining(&self) -> bool {
        self.candidate.is_some()
    }

    // ============================================================
    // 상태 스냅샷 — 화면을 다시 그릴 때 필요한 모든 데이터
    // ============================================================
    pub fn snapshot(&self) -> String {
        // 잔액을 이름순으로 정렬한 배열로 변환
        let mut balances: Vec<BalanceEntry> = self
            .bc
            .balances()
            .iter()
            .filter(|(_, v)| v.abs() > f64::EPSILON)
            .map(|(addr, amount)| BalanceEntry {
                address: addr.clone(),
                amount: *amount,
            })
            .collect();
        balances.sort_by(|a, b| a.address.cmp(&b.address));

        let snapshot = Snapshot {
            height: self.bc.chain().len(),
            difficulty: self.bc.difficulty,
            current_reward: self.bc.current_block_reward(),
            config: self.bc.config.clone(),
            pending: self.bc.pending_transactions.clone(),
            chain: self.bc.chain().to_vec(),
            balances,
            mining: self.candidate.is_some(),
        };

        serde_json::to_string(&snapshot).unwrap_or_else(|_| "{}".to_string())
    }

    // ============================================================
    // 검증 / 위변조 (교육용 핵심)
    // ============================================================
    pub fn validate(&self) -> String {
        let report = self.bc.validate_report();
        serde_json::json!({
            "valid": report.valid,
            "failedBlock": report.failed_block,
            "reason": report.reason,
        })
        .to_string()
    }

    // 이미 채굴된 블록의 거래를 몰래 바꿔치기한다. (해시는 재계산하지 않음)
    pub fn tamper(&mut self, block_index: usize, tx_index: usize, new_to: &str, new_amount: f64) -> bool {
        self.bc
            .tamper_transaction(block_index, tx_index, new_to, new_amount)
    }

    // 조작 + 해시 재계산(채굴은 생략). 검증 ①은 통과하지만 ③(PoW)에서 걸린다.
    pub fn tamper_rehash(&mut self, block_index: usize, tx_index: usize, new_to: &str, new_amount: f64) -> bool {
        self.bc
            .tamper_and_rehash(block_index, tx_index, new_to, new_amount)
    }
}

// ============================================================
// JSON 직렬화용 보조 구조체들
// ============================================================
#[derive(serde::Serialize)]
struct BalanceEntry {
    address: String,
    amount: f64,
}

#[derive(serde::Serialize)]
struct Snapshot {
    height: usize,
    difficulty: usize,
    current_reward: f64,
    config: ChainConfig,
    pending: Vec<Transaction>,
    chain: Vec<crate::block::Block>,
    balances: Vec<BalanceEntry>,
    mining: bool,
}

// ============================================================
// 독립 함수 — SHA-256 놀이터
// ============================================================
// 아무 문자열이나 받아 SHA-256 16진수 해시를 돌려준다.
// 블록 해시와 똑같은 엔진(sha2)을 쓰므로 결과가 동일하다.
#[wasm_bindgen]
pub fn sha256(input: &str) -> String {
    sha256_hex(input)
}

// ============================================================
// 독립 함수 — 채굴 실험실 (Proof of Work 체험)
// ============================================================
// 블록체인 전체와 무관하게, "주어진 데이터 + nonce"의 해시가
// 0이 difficulty개로 시작할 때까지 nonce를 바꿔가며 찾는다.
//
// JS가 start_nonce를 늘려가며 이 함수를 반복 호출하면,
// 무거운 해시 반복은 Rust가 빠르게 처리하고(배치),
// 화면은 매 호출 사이에 진행 상황을 그릴 수 있다.
//
// 반환 JSON: { found, nonce, hash, attempts }
//   found=true  → 정답 nonce를 찾음 (nonce, hash가 정답)
//   found=false → 아직 못 찾음. nonce는 "다음에 이어서 시도할 값"
#[wasm_bindgen]
pub fn pow_try(data: &str, difficulty: usize, start_nonce: u64, batch: u64) -> String {
    let target = "0".repeat(difficulty);
    let mut nonce = start_nonce;
    let end = start_nonce + batch;

    while nonce < end {
        let hash = sha256_hex(&format!("{data}{nonce}"));
        if hash.starts_with(&target) {
            return serde_json::json!({
                "found": true,
                "nonce": nonce,
                "hash": hash,
                "attempts": nonce + 1,
            })
            .to_string();
        }
        nonce += 1;
    }

    // 배치가 끝났지만 못 찾음. 마지막으로 본 해시도 함께 돌려줘 화면에 표시.
    let last_hash = sha256_hex(&format!("{data}{}", end - 1));
    serde_json::json!({
        "found": false,
        "nonce": end,
        "hash": last_hash,
        "attempts": end,
    })
    .to_string()
}

// 데이터+nonce 의 해시 입력 문자열(preimage). 화면에 "무엇을 해시하는지" 보여줄 때.
#[wasm_bindgen]
pub fn pow_preimage(data: &str, nonce: u64) -> String {
    format!("{data}{nonce}")
}

// ============================================================
// WasmUtxo — UTXO 모델 엔진을 브라우저에 노출 (4번 탭)
// ============================================================
use crate::utxo::{SendResult, Utxo, UtxoEngine};

fn utxo_json(u: &Utxo) -> serde_json::Value {
    serde_json::json!({
        "key": Utxo::key(&u.txid, u.vout),
        "txid": u.txid,
        "vout": u.vout,
        "address": u.address,
        "amount": u.amount,
    })
}

fn send_result_json(r: &SendResult) -> String {
    serde_json::json!({
        "ok": r.ok,
        "error": r.error,
        "txid": r.txid,
        "fee": r.fee,
        "selectedSum": r.selected_sum,
        "spent": r.spent.iter().map(utxo_json).collect::<Vec<_>>(),
        "created": r.created.iter().map(|(u, is_change)| {
            let mut v = utxo_json(u);
            v["change"] = serde_json::json!(is_change);
            v
        }).collect::<Vec<_>>(),
        // --- 서명/검증 정보 (Phase 2) ---
        "message": r.message,
        "sighash": r.sighash,
        "signature": r.signature,
        "pubkey": r.pubkey,
        "signerLabel": r.signer_label,
        "signerAddress": r.signer_address,
        "lockAddress": r.lock_address,
        "verified": r.verified,
        // --- 입력별 서명 상세 (실제 비트코인처럼 입력마다 각자 서명) ---
        "inputsSig": r.inputs_sig.iter().map(|s| serde_json::json!({
            "txid": s.txid,
            "vout": s.vout,
            "message": s.message,
            "sighash": s.sighash,
            "signature": s.signature,
            "pubkey": s.pubkey,
            "signerLabel": s.signer_label,
            "signerAddress": s.signer_address,
            "lockAddress": s.lock_address,
            "ownerOk": s.owner_ok,
            "sigOk": s.sig_ok,
        })).collect::<Vec<_>>(),
    })
    .to_string()
}

#[wasm_bindgen]
pub struct WasmUtxo {
    engine: UtxoEngine,
}

#[wasm_bindgen]
impl WasmUtxo {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmUtxo {
        WasmUtxo {
            engine: UtxoEngine::new(),
        }
    }

    // 코인 발행 (코인베이스). 한 주소에 새 UTXO를 만들어 준다.
    pub fn fund(&mut self, address: &str, amount: f64) -> String {
        let r = self.engine.fund(address, amount);
        send_result_json(&r)
    }

    // 송금: 입력 UTXO 소비 + 출력/거스름돈 생성. 보내는 사람의 개인키로 서명.
    pub fn send(&mut self, from: &str, to: &str, amount: f64, fee: f64) -> String {
        let r = self.engine.send(from, to, amount, fee);
        send_result_json(&r)
    }

    // 위조(도둑질) 시도: attacker가 victim의 UTXO를 자기 키로 서명해 가로채려 함.
    // 개인키가 없으므로 서명 검증에서 거부된다(거래는 적용되지 않음).
    pub fn forge(&mut self, attacker: &str, victim: &str, to: &str, amount: f64) -> String {
        let r = self.engine.forge(attacker, victim, to, amount);
        send_result_json(&r)
    }

    // 현재 UTXO 집합 + 주소별(계산된) 잔액
    pub fn snapshot(&self) -> String {
        let mut utxos: Vec<&Utxo> = self.engine.utxos();
        utxos.sort_by(|a, b| {
            a.address
                .cmp(&b.address)
                .then(b.amount.partial_cmp(&a.amount).unwrap())
        });

        // 주소별 잔액 집계
        let mut addrs: Vec<String> = utxos.iter().map(|u| u.address.clone()).collect();
        addrs.sort();
        addrs.dedup();
        let balances: Vec<serde_json::Value> = addrs
            .iter()
            .map(|a| serde_json::json!({ "address": a, "amount": self.engine.balance(a) }))
            .collect();

        // 지갑(키쌍) 목록 — 주소↔라벨, 공개키
        let wallets: Vec<serde_json::Value> = self
            .engine
            .wallets_list()
            .iter()
            .map(|(label, address, pubkey)| {
                serde_json::json!({
                    "label": label,
                    "address": address,
                    "pubkey": pubkey,
                })
            })
            .collect();

        serde_json::json!({
            "utxos": utxos.iter().map(|u| utxo_json(u)).collect::<Vec<_>>(),
            "balances": balances,
            "wallets": wallets,
        })
        .to_string()
    }

    pub fn take_logs(&mut self) -> String {
        let logs = self.engine.drain_logs();
        serde_json::to_string(&logs).unwrap_or_else(|_| "[]".to_string())
    }
}

impl Default for WasmUtxo {
    fn default() -> Self {
        Self::new()
    }
}

// ============================================================
// 블록 해부 (5번 탭) — 머클트리 / 블록헤더 / double SHA-256 / target
// ============================================================
use crate::header::HeaderMiner;
use crate::merkle::{merkle_levels, sha256_once, to_hex as mk_hex};

fn hex_to_32(s: &str) -> [u8; 32] {
    let bytes: Vec<u8> = (0..s.len())
        .step_by(2)
        .filter_map(|i| s.get(i..i + 2))
        .filter_map(|h| u8::from_str_radix(h, 16).ok())
        .collect();
    let mut out = [0u8; 32];
    for (i, b) in bytes.iter().take(32).enumerate() {
        out[i] = *b;
    }
    out
}

// 거래 문자열 배열(JSON) → 머클트리의 모든 층 + 루트
#[wasm_bindgen]
pub fn merkle_tree(txs_json: &str) -> String {
    let txs: Vec<String> = serde_json::from_str(txs_json).unwrap_or_default();
    let levels = merkle_levels(&txs);
    let levels_hex: Vec<Vec<String>> = levels
        .iter()
        .map(|lv| lv.iter().map(|h| mk_hex(h)).collect())
        .collect();
    let root = levels
        .last()
        .map(|l| mk_hex(&l[0]))
        .unwrap_or_default();

    serde_json::json!({
        "txCount": txs.len(),
        "levels": levels_hex,
        "root": root,
    })
    .to_string()
}

// 임의 문자열의 double SHA-256 두 단계(중간/최종)를 보여준다.
#[wasm_bindgen]
pub fn dsha256_steps(input: &str) -> String {
    let first = sha256_once(input.as_bytes());
    let second = sha256_once(&first);
    serde_json::json!({
        "first": mk_hex(&first),
        "second": mk_hex(&second),
    })
    .to_string()
}

fn header_info_json(m: &HeaderMiner) -> serde_json::Value {
    let h = &m.header;
    let ser = h.serialize();
    serde_json::json!({
        "version": h.version,
        "prevHash": mk_hex(&h.prev_hash),
        "merkleRoot": mk_hex(&h.merkle_root),
        "timestamp": h.timestamp,
        "zeroBits": h.zero_bits,
        "nonce": h.nonce,
        "targetHex": mk_hex(&m.target),
        "headerHex": mk_hex(&ser),
        "expectedHashes": 2f64.powi(h.zero_bits as i32),
    })
}

#[wasm_bindgen]
pub struct WasmHeaderMiner {
    miner: HeaderMiner,
}

#[wasm_bindgen]
impl WasmHeaderMiner {
    // prev_hash_hex: 직전 블록 해시(hex, 없으면 0). txs_json: 거래 문자열 배열.
    // zero_bits: 목표 선행 0비트 수(난이도).
    #[wasm_bindgen(constructor)]
    pub fn new(prev_hash_hex: &str, txs_json: &str, zero_bits: u32) -> WasmHeaderMiner {
        let txs: Vec<String> = serde_json::from_str(txs_json).unwrap_or_default();
        let miner = HeaderMiner::new(1, hex_to_32(prev_hash_hex), &txs, zero_bits);
        WasmHeaderMiner { miner }
    }

    // 헤더 필드 + target + 80바이트 직렬화 정보
    pub fn info(&self) -> String {
        header_info_json(&self.miner).to_string()
    }

    // nonce를 batch번 시도. double SHA-256 두 단계와 target 비교 결과를 함께 반환.
    pub fn step(&mut self, batch: u32) -> String {
        let found = self.miner.try_batch(batch);
        let h = &self.miner.header;
        let ser = h.serialize();
        let once = sha256_once(&ser);
        serde_json::json!({
            "found": found,
            "nonce": h.nonce,
            "attempts": if found { h.nonce as u64 + 1 } else { h.nonce as u64 },
            "hashOnce": mk_hex(&once),                 // SHA-256 1번 (중간)
            "hash": mk_hex(&self.miner.last_hash),     // SHA-256 2번 (최종 블록해시)
            "targetHex": mk_hex(&self.miner.target),
            "meets": found,
            "headerHex": mk_hex(&ser),
        })
        .to_string()
    }
}

// ============================================================
// 노드 합의 / P2P (6번 탭) — 여러 노드 · 방송 · 가장 긴 체인
// ============================================================
use crate::network::Network;

#[wasm_bindgen]
pub struct WasmNetwork {
    net: Network,
}

#[wasm_bindgen]
impl WasmNetwork {
    // names_json: 노드 이름 배열(JSON). difficulty: PoW 난이도(선행 0 개수).
    #[wasm_bindgen(constructor)]
    pub fn new(names_json: &str, difficulty: usize) -> WasmNetwork {
        let names: Vec<String> = serde_json::from_str(names_json)
            .unwrap_or_else(|_| vec!["Node A".into(), "Node B".into(), "Node C".into()]);
        let diff = difficulty.clamp(1, 5);
        WasmNetwork {
            net: Network::new(&names, diff),
        }
    }

    // idx번 노드가 블록을 채굴(자기 체인 끝에 추가). 새 스냅샷 반환.
    pub fn mine_on(&mut self, idx: usize) -> String {
        self.net.mine_on(idx);
        self.snapshot()
    }

    // from번 노드가 자기 체인을 이웃에게 방송. 합의 후 스냅샷 반환.
    pub fn broadcast(&mut self, from: usize) -> String {
        self.net.broadcast(from);
        self.snapshot()
    }

    // 모든 노드의 체인 상태(화면 렌더용).
    pub fn snapshot(&self) -> String {
        let nodes: Vec<serde_json::Value> = self
            .net
            .nodes()
            .iter()
            .map(|n| {
                let blocks: Vec<serde_json::Value> = n
                    .chain
                    .iter()
                    .map(|b| {
                        let miner = b
                            .transactions
                            .iter()
                            .find(|t| t.is_coinbase())
                            .map(|t| t.to.clone())
                            .unwrap_or_default();
                        serde_json::json!({
                            "id": b.id,
                            "hash": b.hash,
                            "prevHash": b.previous_hash,
                            "nonce": b.nonce,
                            "miner": miner,
                            "isGenesis": b.id == 0,
                        })
                    })
                    .collect();
                serde_json::json!({
                    "name": n.name,
                    "height": n.chain.len().saturating_sub(1),
                    "tip": n.chain.last().map(|b| b.hash.clone()).unwrap_or_default(),
                    "blocks": blocks,
                })
            })
            .collect();

        serde_json::json!({
            "difficulty": self.net.difficulty(),
            "nodes": nodes,
        })
        .to_string()
    }

    pub fn take_logs(&mut self) -> String {
        let logs = self.net.drain_logs();
        serde_json::to_string(&logs).unwrap_or_else(|_| "[]".to_string())
    }
}

// ============================================================
// 이중지불 공격 (7번 탭) — 공개 체인 vs 공격자 비밀 체인
// ============================================================
use crate::attack::DoubleSpend;
use crate::block::Block as EngBlock;

fn ds_block_json(b: &EngBlock) -> serde_json::Value {
    let miner = b
        .transactions
        .iter()
        .find(|t| t.is_coinbase())
        .map(|t| t.to.clone())
        .unwrap_or_default();
    let txs: Vec<serde_json::Value> = b
        .transactions
        .iter()
        .map(|t| {
            serde_json::json!({
                "from": t.from,
                "to": t.to,
                "amount": t.amount,
                "isCoinbase": t.is_coinbase(),
            })
        })
        .collect();
    serde_json::json!({
        "id": b.id,
        "hash": b.hash,
        "prevHash": b.previous_hash,
        "nonce": b.nonce,
        "miner": miner,
        "isGenesis": b.id == 0,
        "txs": txs,
    })
}

#[wasm_bindgen]
pub struct WasmDoubleSpend {
    ds: DoubleSpend,
}

#[wasm_bindgen]
impl WasmDoubleSpend {
    #[wasm_bindgen(constructor)]
    pub fn new(difficulty: usize, required_conf: usize) -> WasmDoubleSpend {
        WasmDoubleSpend {
            ds: DoubleSpend::new(difficulty, required_conf),
        }
    }

    pub fn start_payment(&mut self) -> String {
        self.ds.start_payment();
        self.snapshot()
    }

    pub fn honest_mine(&mut self) -> String {
        self.ds.honest_mine();
        self.snapshot()
    }

    pub fn attacker_mine(&mut self) -> String {
        self.ds.attacker_mine();
        self.snapshot()
    }

    pub fn reveal(&mut self) -> String {
        self.ds.reveal();
        self.snapshot()
    }

    pub fn snapshot(&self) -> String {
        let public_blocks: Vec<serde_json::Value> =
            self.ds.public_chain().iter().map(ds_block_json).collect();
        let attacker_blocks: Vec<serde_json::Value> =
            self.ds.attacker_chain().iter().map(ds_block_json).collect();

        serde_json::json!({
            "difficulty": self.ds.difficulty(),
            "requiredConf": self.ds.required_conf(),
            "forkLen": self.ds.fork_len(),
            "started": self.ds.started(),
            "shipped": self.ds.shipped(),
            "revealed": self.ds.revealed(),
            "attackWon": self.ds.attack_won(),
            "confirmations": self.ds.confirmations_pub(),
            "merchantBalance": self.ds.merchant_balance_pub(),
            "publicChain": public_blocks,
            "attackerChain": attacker_blocks,
        })
        .to_string()
    }

    pub fn take_logs(&mut self) -> String {
        let logs = self.ds.drain_logs();
        serde_json::to_string(&logs).unwrap_or_else(|_| "[]".to_string())
    }
}

// 공격자 해시파워 q_percent(%)와 상점 컨펌 수 z에 대한
// 이론적 이중지불 성공 확률(0~1). (사토시 백서 공식)
#[wasm_bindgen]
pub fn dbl_spend_probability(q_percent: f64, z: u32) -> f64 {
    crate::attack::success_probability(q_percent / 100.0, z)
}

// 같은 조건을 몬테카를로로 trials번 실험한 성공 비율(0~1).
#[wasm_bindgen]
pub fn dbl_spend_simulate(q_percent: f64, z: u32, trials: u32) -> f64 {
    crate::attack::simulate(q_percent / 100.0, z, trials)
}

// ============================================================
// Ethereum PoS 교육 엔진 (HowEthereumWorks)
// ============================================================

use crate::eth::account::{AccountLedger, UNIT_PER_ETH};
use crate::eth::consensus::PosChain;
use crate::eth::contract::{call_gas, deploy_gas, ContractRegistry};
use crate::eth::keccak::{address_from_label, keccak256_str};

#[wasm_bindgen]
pub fn eth_keccak256(input: &str) -> String {
    keccak256_str(input)
}

#[wasm_bindgen]
pub fn eth_address_from_label(label: &str) -> String {
    address_from_label(label)
}

// ----- 미니 EVM 실행기 (opcode 스텝 뷰어) -----
// program: "store" | "arith" | "escrow".
// calldata_dec: store=v, escrow=price(ETH 단위 정수). gas_limit: gas 예산(BigInt).
// 반환: 바이트코드·디스어셈블·매 스텝 스냅샷(스택/메모리/스토리지/gas)이 담긴 JSON.
#[wasm_bindgen]
pub fn evm_run(program: &str, calldata_dec: &str, gas_limit: u64) -> String {
    let calldata: u128 = calldata_dec.trim().parse().unwrap_or(0);
    let limit = if gas_limit == 0 { 100_000 } else { gas_limit };
    let r = crate::eth::evm::run(program, calldata, limit);
    serde_json::to_string(&r).unwrap_or_else(|_| "{}".into())
}

/// 데모 base fee (per-gas, 내부 단위). 실제 메인넷은 블록마다 변동.
const ETH_BASE_FEE_PER_GAS: u64 = 10;

/// 계정 · 컨트랙트 · 스테이킹 · Gasper 라이트를 한 핸들로 묶은 ETH 교육 엔진
#[wasm_bindgen]
pub struct WasmEth {
    accounts: AccountLedger,
    pos: PosChain,
    contracts: ContractRegistry,
}

#[wasm_bindgen]
impl WasmEth {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmEth {
        let mut eth = WasmEth {
            accounts: AccountLedger::new(),
            pos: PosChain::new(),
            contracts: ContractRegistry::new(),
        };
        // 제네시스 ERC-20: Faucet 이 The Sandbox 스타일 SAND 를 배포하고 Alice/Bob 에 나눠준다
        let faucet_addr = eth.accounts.address_of("Faucet");
        let args = serde_json::json!({ "name": "SAND", "supply": 1200.0 });
        if let Ok(addr) = eth
            .contracts
            .deploy("erc20", "Faucet", &faucet_addr, 0, &args, 0)
        {
            let _ = eth.contracts.call(
                &addr,
                "transfer",
                &serde_json::json!({ "to": "Alice", "amount": 1000.0 }),
                "Faucet",
                0,
            );
            let _ = eth.contracts.call(
                &addr,
                "transfer",
                &serde_json::json!({ "to": "Bob", "amount": 200.0 }),
                "Faucet",
                0,
            );
        }
        // 제네시스 PriceFeed: Oracles 탭에서 바로 report 해볼 수 있게
        let _ = eth.contracts.deploy(
            "pricefeed",
            "Faucet",
            &faucet_addr,
            1,
            &serde_json::json!({ "name": "ETH/USD Feed" }),
            0,
        );
        // oracle 노드도 gas fee 를 내야 하므로 약간의 ETH 지급
        for node in ["Binance", "Bybit", "Coinbase"] {
            eth.accounts.fund(node, 1.0);
        }
        eth
    }

    fn current_proposer(&self) -> String {
        self.pos
            .snapshot()
            .last_proposer
            .filter(|s| !s.is_empty() && s != "—")
            .or_else(|| {
                self.pos
                    .staking()
                    .active_ids()
                    .first()
                    .map(|&id| self.pos.staking().label_of(id))
            })
            .unwrap_or_else(|| "Val-A".into())
    }

    // ----- 계정 -----
    pub fn fund(&mut self, label: &str, eth: f64) {
        self.accounts.fund(label, eth);
    }

    /// EIP-1559 (The Merge 이후): base fee 소각 + priority tip → 현재 헤드 제안자
    /// `priority_fee` 는 per-gas 단위(데모 스케일). base fee 는 네트워크 값(고정 데모).
    pub fn transfer(&mut self, from: &str, to: &str, eth: f64, priority_fee: f64) -> String {
        let tip = priority_fee.max(0.0) as u64;
        let proposer = self.current_proposer();
        let r = self
            .accounts
            .transfer(from, to, eth, ETH_BASE_FEE_PER_GAS, tip, &proposer);
        serde_json::to_string(&r).unwrap_or_else(|_| "{}".into())
    }

    pub fn accounts_snapshot(&self) -> String {
        let accounts = self.accounts.snapshot();
        let mut enriched = Vec::new();
        for a in accounts {
            enriched.push(serde_json::json!({
                "label": a.label,
                "address": a.address,
                "balanceEth": a.balance_wei as f64 / UNIT_PER_ETH as f64,
                "nonce": a.nonce,
            }));
        }
        serde_json::json!({ "accounts": enriched, "unitPerEth": UNIT_PER_ETH }).to_string()
    }

    // ----- 스마트 컨트랙트 -----

    /// 컨트랙트 배포. kind: "vending"|"erc20"|"pricefeed"|"insurance"
    /// args_json 은 종류별 파라미터, value_eth 는 payable constructor 예치금.
    pub fn deploy_contract(
        &mut self,
        kind: &str,
        deployer: &str,
        args_json: &str,
        value_eth: f64,
        priority_fee: f64,
    ) -> String {
        let args: serde_json::Value =
            serde_json::from_str(args_json).unwrap_or(serde_json::json!({}));
        let value_wei = (value_eth.max(0.0) * UNIT_PER_ETH as f64).round() as u64;
        let tip_per_gas = priority_fee.max(0.0) as u64;
        let gas = deploy_gas(kind);
        let proposer = self.current_proposer();

        // 잔액 선검사 (배포 롤백 방지)
        let burn = gas * ETH_BASE_FEE_PER_GAS;
        let tip = gas * tip_per_gas;
        let need = value_wei + burn + tip;
        if self.accounts.balance_wei_of(deployer) < need {
            return serde_json::json!({
                "ok": false,
                "error": format!(
                    "잔액 부족: 배포에 value {:.6} + gas fee {:.6} ETH 필요",
                    value_wei as f64 / UNIT_PER_ETH as f64,
                    (burn + tip) as f64 / UNIT_PER_ETH as f64
                )
            })
            .to_string();
        }

        let deployer_addr = self.accounts.address_of(deployer);
        let nonce = self.accounts.nonce_of(deployer);
        match self
            .contracts
            .deploy(kind, deployer, &deployer_addr, nonce, &args, value_wei)
        {
            Ok(address) => {
                let (used_nonce, burn, tip) = self
                    .accounts
                    .apply_contract_tx(
                        deployer,
                        value_wei,
                        gas,
                        ETH_BASE_FEE_PER_GAS,
                        tip_per_gas,
                        &proposer,
                        true,
                    )
                    .expect("prechecked balance");
                serde_json::json!({
                    "ok": true,
                    "address": address,
                    "kind": kind,
                    "deployer": deployer,
                    "nonce": used_nonce,
                    "gas_used": gas,
                    "base_fee_burned_eth": burn as f64 / UNIT_PER_ETH as f64,
                    "tip_eth": tip as f64 / UNIT_PER_ETH as f64,
                    "value_eth": value_wei as f64 / UNIT_PER_ETH as f64,
                    "proposer": proposer,
                })
                .to_string()
            }
            Err(e) => serde_json::json!({ "ok": false, "error": e }).to_string(),
        }
    }

    /// 컨트랙트 함수 호출. revert 여도 gas fee 는 나간다(실제와 동일).
    pub fn call_contract(
        &mut self,
        address: &str,
        func: &str,
        args_json: &str,
        caller: &str,
        value_eth: f64,
        priority_fee: f64,
    ) -> String {
        let args: serde_json::Value =
            serde_json::from_str(args_json).unwrap_or(serde_json::json!({}));
        let value_wei = (value_eth.max(0.0) * UNIT_PER_ETH as f64).round() as u64;
        let tip_per_gas = priority_fee.max(0.0) as u64;
        let proposer = self.current_proposer();

        // 잔액 선검사: value + 최대 gas fee
        let kind = self.contracts.kind_of(address).unwrap_or_default();
        let gas = call_gas(&kind, func);
        let need = value_wei + gas * (ETH_BASE_FEE_PER_GAS + tip_per_gas);
        if self.accounts.balance_wei_of(caller) < need {
            return serde_json::json!({
                "ok": false,
                "error": format!(
                    "잔액 부족: value + gas fee 로 {:.6} ETH 필요",
                    need as f64 / UNIT_PER_ETH as f64
                )
            })
            .to_string();
        }

        match self.contracts.call(address, func, &args, caller, value_wei) {
            Ok(o) => {
                let (nonce, burn, tip) = self
                    .accounts
                    .apply_contract_tx(
                        caller,
                        value_wei,
                        o.gas_used,
                        ETH_BASE_FEE_PER_GAS,
                        tip_per_gas,
                        &proposer,
                        true,
                    )
                    .expect("prechecked balance");
                for (label, wei) in &o.payouts {
                    self.accounts.credit_wei(label, *wei);
                }
                serde_json::json!({
                    "ok": true,
                    "reverted": false,
                    "note": o.note,
                    "func": func,
                    "caller": caller,
                    "nonce": nonce,
                    "gas_used": o.gas_used,
                    "base_fee_burned_eth": burn as f64 / UNIT_PER_ETH as f64,
                    "tip_eth": tip as f64 / UNIT_PER_ETH as f64,
                    "value_eth": value_wei as f64 / UNIT_PER_ETH as f64,
                    "proposer": proposer,
                    "events": o.events,
                    "payouts": o.payouts.iter().map(|(l, w)| serde_json::json!({
                        "to": l, "eth": *w as f64 / UNIT_PER_ETH as f64
                    })).collect::<Vec<_>>(),
                })
                .to_string()
            }
            Err(rv) => {
                // revert: value 는 안 나가고 gas fee 만 차감, nonce 는 소모
                let applied = self.accounts.apply_contract_tx(
                    caller,
                    0,
                    rv.gas_used,
                    ETH_BASE_FEE_PER_GAS,
                    tip_per_gas,
                    &proposer,
                    false,
                );
                let (burn, tip) = applied
                    .map(|(_, b, t)| (b, t))
                    .unwrap_or((0, 0));
                serde_json::json!({
                    "ok": false,
                    "reverted": true,
                    "error": rv.reason,
                    "func": func,
                    "caller": caller,
                    "gas_used": rv.gas_used,
                    "base_fee_burned_eth": burn as f64 / UNIT_PER_ETH as f64,
                    "tip_eth": tip as f64 / UNIT_PER_ETH as f64,
                    "proposer": proposer,
                })
                .to_string()
            }
        }
    }

    pub fn contracts_snapshot(&self) -> String {
        let list: Vec<_> = self
            .contracts
            .snapshot()
            .iter()
            .map(|c| {
                serde_json::json!({
                    "address": c.address,
                    "kind": c.kind,
                    "name": c.name,
                    "deployer": c.deployer,
                    "createdNonce": c.created_nonce,
                    "balanceEth": c.balance_wei as f64 / UNIT_PER_ETH as f64,
                    "storage": c.storage,
                })
            })
            .collect();
        serde_json::to_string(&list).unwrap_or_else(|_| "[]".into())
    }

    pub fn events_snapshot(&self) -> String {
        serde_json::to_string(self.contracts.events()).unwrap_or_else(|_| "[]".into())
    }

    // ----- 스테이킹 -----
    pub fn stake_deposit(&mut self, label: &str, eth: f64) -> String {
        match self.pos.staking_mut().deposit(label, eth) {
            Ok(id) => serde_json::json!({ "ok": true, "id": id }).to_string(),
            Err(e) => serde_json::json!({ "ok": false, "error": e }).to_string(),
        }
    }

    pub fn stake_activate(&mut self, id: u32) -> String {
        match self.pos.staking_mut().activate(id) {
            Ok(()) => serde_json::json!({ "ok": true }).to_string(),
            Err(e) => serde_json::json!({ "ok": false, "error": e }).to_string(),
        }
    }

    pub fn stake_slash(&mut self, id: u32, reason: &str) -> String {
        match self.pos.staking_mut().slash(id, reason, 0.05) {
            Ok(()) => serde_json::json!({ "ok": true }).to_string(),
            Err(e) => serde_json::json!({ "ok": false, "error": e }).to_string(),
        }
    }

    pub fn stake_offline(&mut self, id: u32, amount: f64) -> String {
        match self.pos.staking_mut().inactivity_penalty(id, amount) {
            Ok(()) => serde_json::json!({ "ok": true }).to_string(),
            Err(e) => serde_json::json!({ "ok": false, "error": e }).to_string(),
        }
    }

    pub fn validators_snapshot(&self) -> String {
        serde_json::to_string(&self.pos.staking().snapshot()).unwrap_or_else(|_| "[]".into())
    }

    // ----- 합의 -----
    pub fn advance_slot(&mut self, offline_fraction: f64) -> String {
        let root = self.compute_state_root();
        match self.pos.advance_slot(offline_fraction, &root) {
            Ok(msg) => serde_json::json!({ "ok": true, "message": msg }).to_string(),
            Err(e) => serde_json::json!({ "ok": false, "error": e }).to_string(),
        }
    }

    /// 교육용 stateRoot: 모든 계정(잔액·nonce) + 모든 컨트랙트(잔액·storage)를
    /// 정렬된 문자열로 직렬화해 keccak 한 지문. 진짜 Merkle-Patricia trie 는 아니다.
    fn compute_state_root(&self) -> String {
        let mut s = String::new();
        for a in self.accounts.snapshot() {
            s.push_str(&format!("{}|{}|{};", a.label, a.balance_wei, a.nonce));
        }
        for c in self.contracts.snapshot() {
            s.push_str(&format!("{}|{}|", c.address, c.balance_wei));
            for (k, v) in &c.storage {
                s.push_str(&format!("{}={},", k, v));
            }
            s.push(';');
        }
        keccak256_str(&s)
    }

    pub fn fork_attack(&mut self, attacker_id: u32) -> String {
        match self.pos.fork_attack(attacker_id) {
            Ok(msg) => serde_json::json!({ "ok": true, "message": msg }).to_string(),
            Err(e) => serde_json::json!({ "ok": false, "error": e }).to_string(),
        }
    }

    pub fn pos_snapshot(&self) -> String {
        serde_json::to_string(&self.pos.snapshot()).unwrap_or_else(|_| "{}".into())
    }

    pub fn reset(&mut self) {
        *self = WasmEth::new();
    }

    pub fn take_logs(&mut self) -> String {
        let mut logs = self.accounts.drain_logs();
        logs.append(&mut self.contracts.drain_logs());
        logs.append(&mut self.pos.drain_logs());
        serde_json::to_string(&logs).unwrap_or_else(|_| "[]".into())
    }
}

impl Default for WasmEth {
    fn default() -> Self {
        Self::new()
    }
}
