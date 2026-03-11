// ============================================================
// blockchain.rs — Blockchain 구조체와 검증/조작 로직을 담당하는 모듈
// ============================================================

use std::collections::HashMap;

use crate::block::Block;
use crate::config::ChainConfig;
use crate::transaction::Transaction;

pub struct Blockchain {
    pub(crate) chain: Vec<Block>,
    pub difficulty: usize,
    pub config: ChainConfig,
    pub pending_transactions: Vec<Transaction>,

    // [NEW] 잔액 캐시 — 매번 전체 체인을 순회하지 않고 즉시 잔액을 조회
    //
    // HashMap<String, f64>는 JavaScript의 Map<string, number>과 같다.
    // 키: 주소(이름), 값: 잔액(BTC)
    // 예: { "Alice": 2.0, "Bob": 15.0, "Miner1": 180.0 }
    //
    // 이전: get_balance() → 블록 전체를 처음부터 끝까지 순회 → 느림
    // 지금: get_balance() → 캐시에서 바로 조회 → 즉시!
    //
    // 블록이 추가되거나 거래가 멤풀에 들어올 때 캐시를 업데이트한다.
    balances: HashMap<String, f64>,
}

impl Blockchain {
    pub fn new(config: ChainConfig) -> Self {
        config.print_config();
        println!("\n  [INIT] 제네시스 블록 채굴 중...");

        let genesis = Block::mine(
            0,
            vec![],
            "0".to_string(),
            config.initial_difficulty,
        );

        Blockchain {
            chain: vec![genesis],
            difficulty: config.initial_difficulty,
            config,
            pending_transactions: Vec::new(),
            balances: HashMap::new(),
        }
    }

    pub fn latest_block(&self) -> &Block {
        self.chain.last().expect("Chain must have at least one block")
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

        println!("\n  ┌─ [난이도 자동 조정] ─────────────────────┐");
        println!(
            "  │  최근 {}블록 실제 시간: {}초",
            self.config.adjustment_interval, actual_time
        );
        println!("  │  목표 시간:            {}초", expected_time);

        let old_difficulty = self.difficulty;

        if actual_time < expected_time / 2 {
            self.difficulty += 1;
            println!("  │  판정: 너무 빠르다! 난이도 UP");
        } else if actual_time > expected_time * 2 {
            if self.difficulty > 1 {
                self.difficulty -= 1;
            }
            println!("  │  판정: 너무 느리다! 난이도 DOWN");
        } else {
            println!("  │  판정: 적절하다. 난이도 유지");
        }

        println!("  │  난이도: {} → {}", old_difficulty, self.difficulty);
        println!("  └──────────────────────────────────────────┘\n");
    }

    pub fn current_block_reward(&self) -> f64 {
        let block_height = self.chain.len() as u64;
        let halvings = block_height / self.config.halving_interval;
        self.config.initial_block_reward / (2_u64.pow(halvings as u32) as f64)
    }

    // ============================================================
    // get_balance() — 캐시에서 즉시 잔액 조회
    // ============================================================
    // 이전: 전체 블록체인을 순회하면서 계산 → O(n) (블록 수에 비례)
    // 지금: HashMap에서 바로 조회 → O(1) (즉시!)
    //
    // *entry.or_insert(0.0) — HashMap에 키가 없으면 0.0을 넣고,
    //                         있으면 기존 값을 가져온다.
    // JavaScript의 map.get(key) ?? 0 과 비슷하다.
    pub fn get_balance(&self, address: &str) -> f64 {
        // .copied() — &f64(참조)를 f64(값)로 복사한다.
        // .unwrap_or(0.0) — 키가 없으면 0.0을 반환한다.
        *self.balances.get(address).unwrap_or(&0.0)
    }

    // 캐시에 거래를 반영한다 (잔액 업데이트)
    fn apply_transaction_to_cache(&mut self, tx: &Transaction) {
        if !tx.is_coinbase() {
            // 보낸 사람 잔액 감소
            let sender = self.balances.entry(tx.from.clone()).or_insert(0.0);
            *sender -= tx.amount;
        }
        // 받는 사람 잔액 증가
        let receiver = self.balances.entry(tx.to.clone()).or_insert(0.0);
        *receiver += tx.amount;
    }

    // 전체 사용자의 잔액을 출력
    pub fn print_balances(&self) {
        println!("  ┌─ [잔액 현황] ─────────────────────────────┐");

        // 잔액이 있는 주소만 출력 (0 이하는 제외)
        // .iter() — HashMap의 (키, 값) 쌍을 하나씩 꺼낸다.
        //           JavaScript의 Object.entries()와 같다.
        let mut entries: Vec<(&String, &f64)> = self.balances.iter().collect();

        // 이름순으로 정렬 (보기 좋게)
        entries.sort_by_key(|(name, _)| name.to_string());

        for (addr, balance) in entries {
            if *balance > 0.0 {
                println!("  │  {:<12} : {:>10.2} BTC", addr, balance);
            }
        }
        println!("  └───────────────────────────────────────────┘");
    }

    // 거래를 멤풀에 추가 — 잔액 검증 포함
    pub fn add_transaction(&mut self, transaction: Transaction) -> bool {
        if transaction.is_coinbase() {
            self.pending_transactions.push(transaction);
            return true;
        }

        let sender_balance = self.get_balance(&transaction.from);

        if sender_balance < transaction.amount {
            println!(
                "  [REJECTED] 거래 거부! {} 잔액 부족 (보유: {:.2} BTC, 시도: {:.2} BTC)",
                transaction.from, sender_balance, transaction.amount
            );
            return false;
        }

        if transaction.amount <= 0.0 {
            println!("  [REJECTED] 거래 거부! 금액은 0보다 커야 합니다.");
            return false;
        }

        println!("  [TX] 거래 승인 → 멤풀 대기: {}", transaction);

        // 멤풀에 추가할 때도 캐시를 업데이트해서 이중 지불을 방지한다.
        self.apply_transaction_to_cache(&transaction);
        self.pending_transactions.push(transaction);
        true
    }

    pub fn mine_pending(&mut self, miner_address: &str) {
        self.adjust_difficulty();

        let reward = self.current_block_reward();
        let coinbase = Transaction::coinbase(miner_address, reward);

        // 코인베이스 거래의 잔액도 캐시에 반영
        self.apply_transaction_to_cache(&coinbase);

        let max_tx = self.config.max_transactions_per_block;
        let take_count = self.pending_transactions.len().min(max_tx);
        let mut transactions: Vec<Transaction> = vec![coinbase];

        // 멤풀의 거래들은 add_transaction()에서 이미 캐시에 반영됐으므로
        // 여기서는 캐시 업데이트 없이 거래만 옮긴다.
        transactions.extend(self.pending_transactions.drain(..take_count));

        let previous_hash = self.latest_block().hash.clone();
        let new_id = self.chain.len() as u64;

        println!(
            "  [MINING] Block #{new_id} 채굴 중... (난이도: {}, 보상: {} BTC, 거래: {}건)",
            self.difficulty,
            reward,
            transactions.len()
        );

        let block = Block::mine(new_id, transactions, previous_hash, self.difficulty);
        self.chain.push(block);
    }

    pub fn validate_chain(&self) -> bool {
        for i in 1..self.chain.len() {
            let current = &self.chain[i];
            let previous = &self.chain[i - 1];

            let recalculated = current.recalculate_hash();
            if current.hash != recalculated {
                println!("  [FAIL] Block #{} 해시 불일치!", current.id);
                println!("         → 누군가 이 블록의 데이터를 조작했다!");
                return false;
            }

            if current.previous_hash != previous.hash {
                println!("  [FAIL] Block #{} 체인 연결 끊김!", current.id);
                return false;
            }
        }

        true
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
