// ============================================================
// block.rs — Block 구조체와 해시 계산을 담당하는 모듈
// ============================================================

use crate::transaction::Transaction;
use sha2::{Digest, Sha256};
use std::fmt::Write;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct Block {
    pub id: u64,
    pub timestamp: u64,
    pub transactions: Vec<Transaction>,
    pub previous_hash: String,
    pub hash: String,
    pub nonce: u64,
}

impl Block {
    pub fn mine(
        id: u64,
        transactions: Vec<Transaction>,
        previous_hash: String,
        difficulty: usize,
    ) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();

        let target = "0".repeat(difficulty);

        // 모든 거래의 해시 문자열을 이어붙인다
        // UTXO 모델에서는 각 거래의 inputs/outputs 정보가 들어간다
        let tx_data = Block::transactions_to_string(&transactions);

        let mut nonce: u64 = 0;

        loop {
            let hash = Block::calculate_hash(id, timestamp, &tx_data, &previous_hash, nonce);

            if hash.starts_with(&target) {
                println!(
                    "  ⛏  채굴 성공! nonce={nonce}, 시도 횟수: {}, 거래 {}건",
                    nonce + 1,
                    transactions.len()
                );
                return Block {
                    id,
                    timestamp,
                    transactions,
                    previous_hash,
                    hash,
                    nonce,
                };
            }

            nonce += 1;
        }
    }

    /// 거래 목록 → 해시 입력 문자열
    /// UTXO 구조에서는 각 거래의 inputs/outputs 정보를 포함한다
    fn transactions_to_string(transactions: &[Transaction]) -> String {
        transactions
            .iter()
            .map(|tx| tx.to_hash_string())
            .collect::<Vec<String>>()
            .join("|")
    }

    pub fn calculate_hash(
        id: u64,
        timestamp: u64,
        tx_data: &str,
        previous_hash: &str,
        nonce: u64,
    ) -> String {
        let input = format!("{id}{timestamp}{tx_data}{previous_hash}{nonce}");

        let mut hasher = Sha256::new();
        hasher.update(input.as_bytes());
        let result = hasher.finalize();

        let mut hex_string = String::new();
        for byte in result {
            write!(hex_string, "{byte:02x}").expect("Failed to write hex");
        }

        hex_string
    }

    pub fn recalculate_hash(&self) -> String {
        let tx_data = Block::transactions_to_string(&self.transactions);
        Block::calculate_hash(
            self.id,
            self.timestamp,
            &tx_data,
            &self.previous_hash,
            self.nonce,
        )
    }
}

impl std::fmt::Display for Block {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Block #{} [hash: {}... | nonce: {} | {}건 거래]",
            self.id,
            &self.hash[..16],
            self.nonce,
            self.transactions.len()
        )
    }
}
