// ============================================================
// blockchain.rs — UTXO 기반 블록체인
// ============================================================
//
// [이전] balances: HashMap<String, f64> — 계좌 잔액
// [지금] utxo_set: HashMap<(tx_id, output_index), TxOutput> — 미사용 쿠폰 목록
//
// UTXO Set = 아직 사용되지 않은 모든 거래 출력의 집합
// 실제 비트코인 노드도 이것을 메모리에 캐싱한다 (chainstate DB).
// 2024년 기준 약 7천만 개의 UTXO가 존재한다.

use std::collections::HashMap;

use crate::block::Block;
use crate::config::ChainConfig;
use crate::transaction::{Transaction, TxInput, TxOutput};
use crate::wallet::Wallet;

/// UTXO를 식별하는 키 — (거래 ID, 출력 인덱스)
/// 예: ("abc123", 0) = abc123 거래의 첫 번째 출력
type UtxoKey = (String, usize);

pub struct Blockchain {
    pub(crate) chain: Vec<Block>,
    pub difficulty: usize,
    pub config: ChainConfig,
    pub pending_transactions: Vec<Transaction>,

    // UTXO Set — 아직 사용되지 않은 "쿠폰" 목록
    //
    // 키: (거래 ID, 출력 인덱스)
    // 값: TxOutput (금액 + 받는 사람 주소)
    //
    // 거래가 블록에 포함되면:
    //   1. inputs가 참조하는 UTXO를 제거 (쿠폰 파기)
    //   2. outputs를 새 UTXO로 추가 (새 쿠폰 발행)
    utxo_set: HashMap<UtxoKey, TxOutput>,

    // 멤풀에서 "예약된" UTXO — 이중지불 방지
    // 멤풀에 들어간 거래가 참조하는 UTXO를 여기에 기록해서
    // 같은 UTXO를 두 번 쓰는 것을 막는다
    reserved_utxos: HashMap<UtxoKey, bool>,
}

impl Blockchain {
    pub fn new(config: ChainConfig) -> Self {
        config.print_config();
        println!("\n  [INIT] 제네시스 블록 채굴 중...");

        let genesis = Block::mine(0, vec![], "0".to_string(), config.initial_difficulty);

        Blockchain {
            chain: vec![genesis],
            difficulty: config.initial_difficulty,
            config,
            pending_transactions: Vec::new(),
            utxo_set: HashMap::new(),
            reserved_utxos: HashMap::new(),
        }
    }

    pub fn latest_block(&self) -> &Block {
        self.chain.last().expect("Chain must have at least one block")
    }

    // ============================================================
    // UTXO 관련 메서드들
    // ============================================================

    /// 특정 주소의 잔액 조회 — UTXO Set에서 해당 주소의 모든 미사용 쿠폰 합산
    ///
    /// "잔액"이라는 필드는 어디에도 없다.
    /// 내 주소로 된 미사용 쿠폰의 금액을 전부 더하는 것이다.
    pub fn get_balance(&self, address: &str) -> f64 {
        self.utxo_set
            .values()
            .filter(|output| output.recipient == address)
            .map(|output| output.amount)
            .sum()
    }

    /// 특정 주소의 UTXO 목록 조회 — 거래를 만들 때 input으로 쓸 쿠폰을 찾기 위해
    pub fn find_utxos_for(&self, address: &str) -> Vec<(UtxoKey, &TxOutput)> {
        self.utxo_set
            .iter()
            .filter(|(key, output)| {
                output.recipient == address && !self.reserved_utxos.contains_key(key)
            })
            .map(|(key, output)| (key.clone(), output))
            .collect()
    }

    /// 거래 생성 헬퍼 — 필요한 UTXO를 자동으로 찾아서 거래를 만든다
    ///
    /// 쿠폰 교환의 전체 과정을 한 번에 처리:
    /// 1. 보낼 금액 + 수수료를 충당할 UTXO(쿠폰)를 찾는다
    /// 2. 받는 사람에게 보낼 출력을 만든다
    /// 3. 거스름돈이 있으면 나에게 돌아오는 출력도 만든다
    /// 4. 서명한다
    pub fn create_transaction(
        &self,
        sender_wallet: &Wallet,
        recipient_address: &str,
        amount: f64,
        fee: f64,
    ) -> Result<Transaction, String> {
        let total_needed = amount + fee;

        // 1. 사용할 UTXO(쿠폰)들을 모은다
        let available_utxos = self.find_utxos_for(&sender_wallet.public_key);
        let mut selected_inputs: Vec<TxInput> = Vec::new();
        let mut input_sum: f64 = 0.0;

        for ((tx_id, output_index), utxo) in &available_utxos {
            selected_inputs.push(TxInput {
                tx_id: tx_id.clone(),
                output_index: *output_index,
                signature: String::new(),
                public_key: sender_wallet.public_key.clone(),
            });
            input_sum += utxo.amount;

            if input_sum >= total_needed {
                break;
            }
        }

        if input_sum < total_needed {
            return Err(format!(
                "잔액 부족! 보유: {:.2} BTC, 필요: {:.2} BTC (전송: {:.2} + 수수료: {:.2})",
                input_sum, total_needed, amount, fee
            ));
        }

        // 2. 출력(새 쿠폰) 생성
        let mut outputs = vec![TxOutput {
            amount,
            recipient: recipient_address.to_string(),
        }];

        // 3. 거스름돈이 있으면 나에게 돌려주는 출력 추가
        let change = input_sum - total_needed;
        if change > 0.0 {
            outputs.push(TxOutput {
                amount: change,
                recipient: sender_wallet.public_key.clone(),
            });
        }

        // 4. 거래 생성 + 서명
        let mut tx = Transaction::new(selected_inputs, outputs);
        tx.sign_all_inputs(sender_wallet);

        Ok(tx)
    }

    // ============================================================
    // 거래 검증 + 멤풀 관리
    // ============================================================

    /// 거래를 멤풀에 추가 — UTXO 존재 확인 + 서명 검증 + 이중지불 방지
    pub fn add_transaction(&mut self, transaction: Transaction) -> bool {
        if transaction.is_coinbase() {
            self.pending_transactions.push(transaction);
            return true;
        }

        // 1. 각 input이 참조하는 UTXO가 존재하는지 + 서명이 유효한지 확인
        let mut input_sum = 0.0;

        for input in &transaction.inputs {
            let key = (input.tx_id.clone(), input.output_index);

            // UTXO가 존재하는지 확인
            let Some(utxo) = self.utxo_set.get(&key) else {
                println!(
                    "  [REJECTED] 존재하지 않는 UTXO 참조! tx:{}... index:{}",
                    &input.tx_id[..16],
                    input.output_index
                );
                return false;
            };

            // 이미 멤풀에서 예약된 UTXO인지 확인 (이중지불 방지)
            if self.reserved_utxos.contains_key(&key) {
                println!(
                    "  [REJECTED] 이중지불 시도! 이 UTXO는 이미 사용 예약됨"
                );
                return false;
            }

            // 서명 검증 — 이 UTXO의 주인이 정말 이 거래를 보낸 사람인지
            if input.public_key != utxo.recipient {
                println!(
                    "  [REJECTED] 공개키 불일치! 이 UTXO의 소유자가 아닙니다"
                );
                return false;
            }

            // 디지털 서명 검증
            if !Wallet::verify(&input.public_key, &transaction.id, &input.signature) {
                println!("  [REJECTED] 서명 검증 실패! 위조된 거래입니다");
                return false;
            }

            input_sum += utxo.amount;
        }

        // 2. output 합계가 input 합계를 초과하지 않는지 확인
        let output_sum = transaction.output_sum();
        if output_sum > input_sum {
            println!(
                "  [REJECTED] 출력({:.2})이 입력({:.2})보다 큽니다! 없는 돈을 만들 수 없습니다",
                output_sum, input_sum
            );
            return false;
        }

        let fee = transaction.fee(input_sum);
        println!(
            "  [TX] 거래 승인 → 멤풀 대기 (수수료: {:.4} BTC): {}",
            fee, transaction
        );

        // 3. 이 거래의 inputs를 예약 (이중지불 방지)
        for input in &transaction.inputs {
            let key = (input.tx_id.clone(), input.output_index);
            self.reserved_utxos.insert(key, true);
        }

        self.pending_transactions.push(transaction);
        true
    }

    /// UTXO Set에 거래를 반영
    fn apply_transaction_to_utxo(&mut self, tx: &Transaction) {
        // 1. inputs가 참조하는 UTXO 제거 (쿠폰 파기)
        for input in &tx.inputs {
            let key = (input.tx_id.clone(), input.output_index);
            self.utxo_set.remove(&key);
            self.reserved_utxos.remove(&key);
        }

        // 2. outputs를 새 UTXO로 추가 (새 쿠폰 발행)
        for (index, output) in tx.outputs.iter().enumerate() {
            let key = (tx.id.clone(), index);
            self.utxo_set.insert(key, output.clone());
        }
    }

    // ============================================================
    // 채굴
    // ============================================================

    pub fn mine_pending(&mut self, miner_address: &str) {
        self.adjust_difficulty();

        let reward = self.current_block_reward();

        // 수수료 높은 순으로 정렬 — 채굴자가 수익을 극대화
        self.sort_pending_by_fee();

        let max_tx = self.config.max_transactions_per_block;
        let take_count = self.pending_transactions.len().min(max_tx);

        // 멤풀에서 꺼낼 거래들과 수수료 합계 계산
        let mut total_fees = 0.0;
        for tx in self.pending_transactions.iter().take(take_count) {
            if !tx.is_coinbase() {
                let input_sum: f64 = tx
                    .inputs
                    .iter()
                    .filter_map(|input| {
                        let key = (input.tx_id.clone(), input.output_index);
                        self.utxo_set.get(&key).map(|o| o.amount)
                    })
                    .sum();
                total_fees += tx.fee(input_sum);
            }
        }

        // 코인베이스 거래: 채굴 보상 + 수수료
        let coinbase = Transaction::coinbase(miner_address, reward + total_fees);

        let mut transactions: Vec<Transaction> = vec![coinbase];
        transactions.extend(self.pending_transactions.drain(..take_count));

        let previous_hash = self.latest_block().hash.clone();
        let new_id = self.chain.len() as u64;

        println!(
            "  [MINING] Block #{new_id} 채굴 중... (난이도: {}, 보상: {:.2} BTC + 수수료: {:.4} BTC, 거래: {}건)",
            self.difficulty,
            reward,
            total_fees,
            transactions.len()
        );

        // UTXO Set 업데이트
        for tx in &transactions {
            self.apply_transaction_to_utxo(tx);
        }

        let block = Block::mine(new_id, transactions, previous_hash, self.difficulty);
        self.chain.push(block);
    }

    /// 멤풀 거래를 수수료 높은 순으로 정렬
    fn sort_pending_by_fee(&mut self) {
        let utxo_ref = &self.utxo_set;

        self.pending_transactions.sort_by(|a, b| {
            let fee_a = if a.is_coinbase() {
                0.0
            } else {
                let sum_a: f64 = a
                    .inputs
                    .iter()
                    .filter_map(|i| {
                        utxo_ref
                            .get(&(i.tx_id.clone(), i.output_index))
                            .map(|o| o.amount)
                    })
                    .sum();
                a.fee(sum_a)
            };

            let fee_b = if b.is_coinbase() {
                0.0
            } else {
                let sum_b: f64 = b
                    .inputs
                    .iter()
                    .filter_map(|i| {
                        utxo_ref
                            .get(&(i.tx_id.clone(), i.output_index))
                            .map(|o| o.amount)
                    })
                    .sum();
                b.fee(sum_b)
            };

            fee_b
                .partial_cmp(&fee_a)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
    }

    // ============================================================
    // 난이도 조정 / 보상
    // ============================================================

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
    // 출력 + 검증
    // ============================================================

    /// 특정 주소의 UTXO 목록 출력
    pub fn print_utxos(&self, address: &str, name: &str) {
        let utxos = self.find_utxos_for(address);
        let balance: f64 = utxos.iter().map(|(_, o)| o.amount).sum();

        println!(
            "  │  {} ({}...): {:.2} BTC ({} UTXO)",
            name,
            &address[..12],
            balance,
            utxos.len()
        );
        for ((tx_id, idx), output) in &utxos {
            println!(
                "  │    └ {:.2} BTC (tx:{}... [{}])",
                output.amount,
                &tx_id[..12],
                idx
            );
        }
    }

    /// 전체 잔액 현황 출력 (UTXO 기반)
    pub fn print_balances(&self, wallets: &[&Wallet]) {
        println!("  ┌─ [UTXO 잔액 현황] ────────────────────────┐");
        for wallet in wallets {
            self.print_utxos(&wallet.public_key, &wallet.name);
        }
        println!("  └───────────────────────────────────────────┘");
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
