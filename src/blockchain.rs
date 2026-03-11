// ============================================================
// blockchain.rs — Blockchain 구조체와 검증/조작 로직을 담당하는 모듈
// ============================================================

use crate::block::Block;
use crate::config::ChainConfig;
use crate::transaction::Transaction;

pub struct Blockchain {
    pub(crate) chain: Vec<Block>,
    pub difficulty: usize,
    pub config: ChainConfig,

    // [NEW] 아직 블록에 포함되지 않은 대기 중인 거래들
    // 실제 비트코인에서는 이걸 "멤풀(Mempool)"이라고 부른다.
    // 거래가 들어오면 여기에 쌓이고, 채굴할 때 여기서 꺼내서 블록에 넣는다.
    pub pending_transactions: Vec<Transaction>,
}

impl Blockchain {
    pub fn new(config: ChainConfig) -> Self {
        config.print_config();
        println!("\n  [INIT] 제네시스 블록 채굴 중...");

        // 제네시스 블록은 거래 없이 빈 블록으로 생성
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
        }
    }

    pub fn latest_block(&self) -> &Block {
        self.chain.last().expect("Chain must have at least one block")
    }

    // 난이도 자동 조정
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
    // get_balance() — 특정 주소의 잔액을 계산한다
    // ============================================================
    // 블록체인에 "잔액"이라는 필드는 없다.
    // 전체 거래 내역을 처음부터 끝까지 훑으면서
    // "받은 금액 - 보낸 금액 = 잔액"을 계산한다.
    //
    // 실제 비트코인은 UTXO 모델이라 방식이 다르지만,
    // 결과적으로 "사용 가능한 금액"을 구하는 건 같다.
    pub fn get_balance(&self, address: &str) -> f64 {
        let mut balance: f64 = 0.0;

        // 블록체인에 기록된 모든 블록의 모든 거래를 확인
        for block in &self.chain {
            for tx in &block.transactions {
                // 이 주소가 받은 거래 → 잔액 증가
                if tx.to == address {
                    balance += tx.amount;
                }
                // 이 주소가 보낸 거래 → 잔액 감소 (코인베이스는 제외)
                if tx.from == address && !tx.is_coinbase() {
                    balance -= tx.amount;
                }
            }
        }

        // 멤풀(대기 중인 거래)도 고려한다.
        // 아직 블록에 안 들어갔지만, 보내기로 한 금액은 빼야 한다.
        // 안 그러면 같은 돈을 두 번 보내는 "이중 지불"이 가능해진다.
        for tx in &self.pending_transactions {
            if tx.to == address {
                balance += tx.amount;
            }
            if tx.from == address && !tx.is_coinbase() {
                balance -= tx.amount;
            }
        }

        balance
    }

    // 전체 사용자의 잔액을 출력한다
    pub fn print_balances(&self) {
        // 모든 거래에서 등장하는 주소를 수집한다.
        // Vec을 쓰고 중복 체크 — 간단한 교육용 구현
        let mut addresses: Vec<String> = Vec::new();

        for block in &self.chain {
            for tx in &block.transactions {
                if !tx.is_coinbase() && !addresses.contains(&tx.from) {
                    addresses.push(tx.from.clone());
                }
                if !addresses.contains(&tx.to) {
                    addresses.push(tx.to.clone());
                }
            }
        }

        println!("  ┌─ [잔액 현황] ─────────────────────────────┐");
        for addr in &addresses {
            println!("  │  {:<12} : {:>10.2} BTC", addr, self.get_balance(addr));
        }
        println!("  └───────────────────────────────────────────┘");
    }

    // 거래를 대기열(멤풀)에 추가한다 — 잔액 검증 포함!
    // 보내는 사람의 잔액이 부족하면 거래를 거부한다.
    pub fn add_transaction(&mut self, transaction: Transaction) -> bool {
        // 코인베이스 거래는 검증 없이 통과 (새 코인 생성이니까)
        if transaction.is_coinbase() {
            self.pending_transactions.push(transaction);
            return true;
        }

        // 잔액 검증: 보내는 사람이 충분한 잔액을 가지고 있는가?
        let sender_balance = self.get_balance(&transaction.from);

        if sender_balance < transaction.amount {
            println!(
                "  [REJECTED] 거래 거부! {} 잔액 부족 (보유: {:.2} BTC, 시도: {:.2} BTC)",
                transaction.from, sender_balance, transaction.amount
            );
            return false;
        }

        // 금액이 0 이하인 거래도 거부
        if transaction.amount <= 0.0 {
            println!("  [REJECTED] 거래 거부! 금액은 0보다 커야 합니다.");
            return false;
        }

        println!("  [TX] 거래 승인 → 멤풀 대기: {}", transaction);
        self.pending_transactions.push(transaction);
        true
    }

    // [NEW] 대기 중인 거래들을 모아서 블록을 채굴한다.
    // miner_address: 채굴 보상을 받을 주소
    //
    // 실제 비트코인 흐름:
    //   1. 사용자들이 거래를 보냄 → 멤풀에 쌓임
    //   2. 채굴자가 멤풀에서 거래를 골라서 블록에 넣음
    //   3. 맨 앞에 코인베이스 거래(채굴 보상)를 추가
    //   4. 채굴 시작!
    pub fn mine_pending(&mut self, miner_address: &str) {
        self.adjust_difficulty();

        let reward = self.current_block_reward();

        // 코인베이스 거래를 맨 앞에 추가 (채굴자에게 보상)
        let coinbase = Transaction::coinbase(miner_address, reward);

        // 대기 중인 거래를 가져오고, 멤풀을 비운다.
        // max_transactions_per_block만큼만 가져온다 (나머지는 다음 블록에서).
        // .drain(..) — 배열에서 요소를 꺼내면서 원본 배열을 비운다.
        //              JavaScript의 splice(0)와 비슷하다.
        let max_tx = self.config.max_transactions_per_block;
        let take_count = self.pending_transactions.len().min(max_tx);
        let mut transactions: Vec<Transaction> = vec![coinbase];
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

    // 전체 체인 출력 — 이제 거래 내역도 보여준다
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

            // 각 거래를 출력
            for tx in &block.transactions {
                println!("  │  📄 {tx}");
            }

            println!("  │");
        }
        println!("  └─ [end of chain]");
    }
}
