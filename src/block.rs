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

    // [CHANGED] data: String → transactions: Vec<Transaction>
    // 이제 블록 하나에 여러 거래를 담을 수 있다.
    // 실제 비트코인 블록에도 수천 건의 거래가 들어있다.
    pub transactions: Vec<Transaction>,

    pub previous_hash: String,
    pub hash: String,
    pub nonce: u64,
}

impl Block {
    // 채굴! 거래 목록을 받아서 블록을 만든다.
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

        // 거래 목록을 해시 입력용 문자열로 변환
        // 모든 거래의 내용을 이어붙여서 하나의 문자열로 만든다.
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

    // 거래 목록을 하나의 문자열로 변환 (해시 계산용)
    // 예: "Alice->Bob:10|Bob->Charlie:3|COINBASE->Miner:50"
    fn transactions_to_string(transactions: &[Transaction]) -> String {
        transactions
            .iter()                           // 배열의 각 요소를 하나씩 꺼냄
            .map(|tx| tx.to_hash_string())    // 각 거래를 문자열로 변환
            .collect::<Vec<String>>()         // 변환 결과를 배열로 모음
            .join("|")                        // "|"로 이어붙임
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

    // 검증용: 현재 블록의 필드들로 해시를 다시 계산
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

// Display — 블록 출력 형식
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
