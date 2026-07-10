// ============================================================
// blockchain.rs — Blockchain 구조체와 검증/조작 로직을 담당하는 모듈
// ============================================================

use std::collections::HashMap;

use crate::block::{Block, MiningCandidate};
use crate::config::ChainConfig;
use crate::transaction::Transaction;

// 검증 결과를 구조화해서 전달한다.
// CLI에서는 valid만 보면 되고, 브라우저에서는 어느 블록이 왜 깨졌는지까지 보여준다.
pub struct ValidationReport {
    pub valid: bool,
    pub failed_block: Option<u64>,
    pub reason: String,
}

pub struct Blockchain {
    pub(crate) chain: Vec<Block>,
    pub difficulty: usize,
    pub config: ChainConfig,
    pub pending_transactions: Vec<Transaction>,

    // 잔액 캐시 — 매번 전체 체인을 순회하지 않고 즉시 잔액을 조회
    // 키: 주소(이름), 값: 잔액(BTC)  예: { "Alice": 2.0, "Bob": 15.0 }
    balances: HashMap<String, f64>,

    // [NEW] 엔진 로그 버퍼
    // println!은 터미널 전용이라 브라우저에서는 보이지 않는다.
    // 그래서 사람이 읽을 메시지를 여기에도 쌓아두고,
    // 브라우저(WASM)에서 꺼내 "엔진 로그" 패널에 그대로 출력한다.
    logs: Vec<String>,
}

impl Blockchain {
    pub fn new(config: ChainConfig) -> Self {
        config.print_config();

        let mut blockchain = Blockchain {
            chain: Vec::new(),
            difficulty: config.initial_difficulty,
            config,
            pending_transactions: Vec::new(),
            balances: HashMap::new(),
            logs: Vec::new(),
        };

        blockchain.log("[INIT] 제네시스 블록 채굴 중...".to_string());

        // 제네시스 블록: 거래가 없는 최초의 블록
        let genesis = Block::mine(0, vec![], "0".to_string(), blockchain.difficulty);
        blockchain.log(format!(
            "[INIT] 제네시스 블록 생성 완료 (hash: {}...)",
            &genesis.hash[..16]
        ));
        blockchain.chain.push(genesis);

        blockchain
    }

    // 사람이 읽을 메시지를 (1) 터미널에 출력하고 (2) 로그 버퍼에도 쌓는다.
    fn log(&mut self, msg: String) {
        println!("  {msg}");
        self.logs.push(msg);
    }

    // 쌓인 로그를 꺼내 비운다. (브라우저가 주기적으로 가져가 화면에 표시)
    pub fn drain_logs(&mut self) -> Vec<String> {
        std::mem::take(&mut self.logs)
    }

    pub fn latest_block(&self) -> &Block {
        self.chain.last().expect("Chain must have at least one block")
    }

    // 읽기 전용 접근자 (브라우저로 스냅샷을 만들 때 사용)
    pub fn chain(&self) -> &[Block] {
        &self.chain
    }

    pub fn balances(&self) -> &HashMap<String, f64> {
        &self.balances
    }

    fn adjust_difficulty(&mut self) {
        let chain_len = self.chain.len() as u64;

        if chain_len < self.config.adjustment_interval
            || chain_len % self.config.adjustment_interval != 0
        {
            return;
        }

        let start_index = (chain_len - self.config.adjustment_interval) as usize;
        let start_time = self.chain[start_index].timestamp;
        let end_time = self.latest_block().timestamp;

        let actual_time = end_time - start_time;
        let expected_time = self.config.target_time_per_block * self.config.adjustment_interval;

        let old_difficulty = self.difficulty;

        let verdict = if actual_time < expected_time / 2 {
            self.difficulty += 1;
            "너무 빠르다! 난이도 UP"
        } else if actual_time > expected_time * 2 {
            if self.difficulty > 1 {
                self.difficulty -= 1;
            }
            "너무 느리다! 난이도 DOWN"
        } else {
            "적절하다. 난이도 유지"
        };

        self.log(format!(
            "[난이도 조정] 최근 {}블록 실제 {}초 / 목표 {}초 → {} (난이도 {} → {})",
            self.config.adjustment_interval,
            actual_time,
            expected_time,
            verdict,
            old_difficulty,
            self.difficulty
        ));
    }

    pub fn current_block_reward(&self) -> f64 {
        let block_height = self.chain.len() as u64;
        let halvings = block_height / self.config.halving_interval;
        self.config.initial_block_reward / (2_u64.pow(halvings as u32) as f64)
    }

    // 캐시에서 즉시 잔액 조회 → O(1)
    pub fn get_balance(&self, address: &str) -> f64 {
        *self.balances.get(address).unwrap_or(&0.0)
    }

    // 캐시에 거래를 반영한다 (잔액 업데이트)
    fn apply_transaction_to_cache(&mut self, tx: &Transaction) {
        if !tx.is_coinbase() {
            let sender = self.balances.entry(tx.from.clone()).or_insert(0.0);
            *sender -= tx.amount;
        }
        let receiver = self.balances.entry(tx.to.clone()).or_insert(0.0);
        *receiver += tx.amount;
    }

    // 전체 사용자의 잔액을 출력 (CLI 전용)
    pub fn print_balances(&self) {
        println!("  ┌─ [잔액 현황] ─────────────────────────────┐");
        let mut entries: Vec<(&String, &f64)> = self.balances.iter().collect();
        entries.sort_by_key(|(name, _)| name.to_string());
        for (addr, balance) in entries {
            if *balance > 0.0 {
                println!("  │  {:<12} : {:>10.2} BTC", addr, balance);
            }
        }
        println!("  └───────────────────────────────────────────┘");
    }

    // 거래를 멤풀에 추가 — 잔액 검증 포함
    // 반환값: 승인 여부(true/false). 거부 사유는 로그에 남는다.
    pub fn add_transaction(&mut self, transaction: Transaction) -> bool {
        if transaction.is_coinbase() {
            self.pending_transactions.push(transaction);
            return true;
        }

        if transaction.amount <= 0.0 {
            self.log("[REJECTED] 거래 거부! 금액은 0보다 커야 합니다.".to_string());
            return false;
        }

        let sender_balance = self.get_balance(&transaction.from);

        if sender_balance < transaction.amount {
            self.log(format!(
                "[REJECTED] 거래 거부! {} 잔액 부족 (보유: {:.2} BTC, 시도: {:.2} BTC)",
                transaction.from, sender_balance, transaction.amount
            ));
            return false;
        }

        self.log(format!("[TX] 거래 승인 → 멤풀 대기: {}", transaction));

        // 멤풀에 추가할 때도 캐시를 업데이트해서 이중 지불을 방지한다.
        self.apply_transaction_to_cache(&transaction);
        self.pending_transactions.push(transaction);
        true
    }

    // ============================================================
    // 채굴을 1) 준비 2) 실행 3) 확정 세 단계로 분리
    // ============================================================
    // CLI는 아래 mine_pending()이 세 단계를 한 번에 처리하고,
    // 브라우저는 prepare_mining() → (애니메이션) → commit_block()으로
    // 채굴 과정을 실시간으로 그린다.

    // 1) 준비: 난이도 조정 + 코인베이스 생성 + 멤풀 거래를 모아 "채굴 후보" 생성
    pub fn prepare_mining(&mut self, miner_address: &str) -> MiningCandidate {
        self.adjust_difficulty();

        let reward = self.current_block_reward();
        let coinbase = Transaction::coinbase(miner_address, reward);

        // 코인베이스(채굴 보상)도 잔액 캐시에 반영
        self.apply_transaction_to_cache(&coinbase);

        let max_tx = self.config.max_transactions_per_block;
        let take_count = self.pending_transactions.len().min(max_tx);
        let mut transactions: Vec<Transaction> = vec![coinbase];
        transactions.extend(self.pending_transactions.drain(..take_count));

        let previous_hash = self.latest_block().hash.clone();
        let new_id = self.chain.len() as u64;
        let timestamp = crate::time::now_secs();

        self.log(format!(
            "[MINING] Block #{new_id} 채굴 시작 (난이도: {}, 보상: {} BTC, 거래: {}건)",
            self.difficulty,
            reward,
            transactions.len()
        ));

        MiningCandidate::new(new_id, timestamp, transactions, previous_hash, self.difficulty)
    }

    // 3) 확정: 완성된 블록을 체인에 추가
    pub fn commit_block(&mut self, block: Block) {
        self.log(format!(
            "[MINED] Block #{} 확정! nonce={}, hash={}...",
            block.id,
            block.nonce,
            &block.hash[..16]
        ));
        self.chain.push(block);
    }

    // CLI용: 준비→채굴→확정을 한 번에 (브라우저는 이 함수를 쓰지 않는다)
    pub fn mine_pending(&mut self, miner_address: &str) {
        let mut candidate = self.prepare_mining(miner_address);

        let block = loop {
            if let Some(b) = candidate.try_batch(2_000_000) {
                break b;
            }
        };

        self.commit_block(block);
    }

    // ============================================================
    // 검증 — 구조화된 보고서를 반환
    // ============================================================
    pub fn validate_report(&self) -> ValidationReport {
        for i in 1..self.chain.len() {
            let current = &self.chain[i];
            let previous = &self.chain[i - 1];

            // 1) 블록 내용을 다시 해시 → 저장된 해시와 비교 (데이터 조작 감지)
            let recalculated = current.recalculate_hash();
            if current.hash != recalculated {
                return ValidationReport {
                    valid: false,
                    failed_block: Some(current.id),
                    reason: format!(
                        "Block #{} 해시 불일치! 누군가 거래 데이터를 조작했다. (저장:{}... / 재계산:{}...)",
                        current.id,
                        &current.hash[..16],
                        &recalculated[..16]
                    ),
                };
            }

            // 2) previous_hash가 이전 블록의 hash와 일치하는지 (체인 연결 확인)
            if current.previous_hash != previous.hash {
                return ValidationReport {
                    valid: false,
                    failed_block: Some(current.id),
                    reason: format!("Block #{} 체인 연결 끊김!", current.id),
                };
            }

            // 3) 작업증명(PoW) 확인: 해시가 그 블록의 난이도만큼 0으로 시작하는가.
            // 데이터를 바꾼 뒤 해시만 다시 계산(re-hash)하고 채굴(nonce 찾기)은
            // 하지 않은 경우, 해시가 0으로 시작하지 않아 여기서 걸린다.
            let target = "0".repeat(current.difficulty);
            if !current.hash.starts_with(&target) {
                return ValidationReport {
                    valid: false,
                    failed_block: Some(current.id),
                    reason: format!(
                        "Block #{} 작업증명 불충족! 해시가 0 {}개로 시작하지 않는다 (재채굴되지 않은 블록).",
                        current.id, current.difficulty
                    ),
                };
            }
        }

        ValidationReport {
            valid: true,
            failed_block: None,
            reason: "모든 블록의 해시와 연결이 정상입니다.".to_string(),
        }
    }

    // CLI용 얇은 래퍼: 보고서를 받아 출력하고 bool만 돌려준다.
    pub fn validate_chain(&self) -> bool {
        let report = self.validate_report();
        if !report.valid {
            println!("  [FAIL] {}", report.reason);
        }
        report.valid
    }

    // ============================================================
    // 위변조 시뮬레이션 (교육용)
    // ============================================================
    // 이미 채굴된 블록 속 거래를 몰래 바꿔치기한다.
    // 해시는 다시 계산하지 않으므로, validate_report()가 "해시 불일치"로 잡아낸다.
    // → "블록체인은 왜 조작이 불가능한가"를 직접 체험하는 핵심 기능.
    pub fn tamper_transaction(
        &mut self,
        block_index: usize,
        tx_index: usize,
        new_to: &str,
        new_amount: f64,
    ) -> bool {
        if let Some(block) = self.chain.get_mut(block_index) {
            if let Some(tx) = block.transactions.get_mut(tx_index) {
                tx.to = new_to.to_string();
                tx.amount = new_amount;
                return true;
            }
        }
        false
    }

    // 위변조 + 해시 재계산(단, 채굴=nonce 찾기는 하지 않음).
    // 데이터를 바꾼 뒤 해시를 새로 맞추므로 검증 ①(내용-해시 일치)은 통과하지만,
    // 새 해시는 난이도(0의 개수)를 만족하지 못하므로 ③(작업증명)에서 걸린다.
    // → "재해시만으론 부족하고 진짜 채굴이 필요하다"를 보여주는 교육용 기능.
    pub fn tamper_and_rehash(
        &mut self,
        block_index: usize,
        tx_index: usize,
        new_to: &str,
        new_amount: f64,
    ) -> bool {
        if let Some(block) = self.chain.get_mut(block_index) {
            match block.transactions.get_mut(tx_index) {
                Some(tx) => {
                    tx.to = new_to.to_string();
                    tx.amount = new_amount;
                }
                None => return false,
            }
            // 해시만 다시 계산해서 저장 (채굴은 생략 → PoW 불충족 상태가 됨)
            let new_hash = block.recalculate_hash();
            block.hash = new_hash;
            return true;
        }
        false
    }

    pub fn print_chain(&self) {
        println!(
            "=== Visual Bitcoin Engine (difficulty: {}) ===",
            self.difficulty
        );
        println!("Chain length: {}\n", self.chain.len());

        for block in &self.chain {
            println!("  ┌─ {block}");
            println!(
                "  │  prev_hash: {}...",
                &block.previous_hash[..16.min(block.previous_hash.len())]
            );
            println!("  │  full_hash: {}", block.hash);

            for tx in &block.transactions {
                println!("  │  📄 {tx}");
            }

            println!("  │");
        }
        println!("  └─ [end of chain]");
    }
}
