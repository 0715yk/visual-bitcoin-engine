// ============================================================
// block.rs — Block 구조체와 해시 계산을 담당하는 모듈
// ============================================================

use crate::time::now_secs;
use crate::transaction::Transaction;
use sha2::{Digest, Sha256};
use std::fmt::Write;

// Serialize: 블록을 통째로 브라우저(JS)로 넘겨 화면에 그릴 수 있게 한다.
#[derive(Debug, Clone, serde::Serialize)]
pub struct Block {
    pub id: u64,
    pub timestamp: u64,

    // 블록 하나에 여러 거래를 담을 수 있다.
    // 실제 비트코인 블록에도 수천 건의 거래가 들어있다.
    pub transactions: Vec<Transaction>,

    pub previous_hash: String,
    pub hash: String,
    pub nonce: u64,

    // 이 블록이 채굴된 난이도(요구 선행 0의 개수).
    // 난이도는 조정될 수 있으므로 블록마다 "그때의 난이도"를 저장해둔다.
    // (실제 비트코인 헤더의 bits 필드에 해당) → 검증 때 PoW 확인에 사용.
    pub difficulty: usize,
}

impl Block {
    // 채굴! 거래 목록을 받아서 블록을 만든다. (한 방에 끝까지 채굴)
    //
    // CLI(터미널)에서는 이 함수를 그대로 쓴다. 내부적으로는
    // MiningCandidate를 돌려서 정답 nonce를 찾을 때까지 반복한다.
    pub fn mine(
        id: u64,
        transactions: Vec<Transaction>,
        previous_hash: String,
        difficulty: usize,
    ) -> Self {
        // 시간은 플랫폼별 함수로 구한다 (CLI=OS시계, 브라우저=Date.now)
        let timestamp = now_secs();

        let mut candidate =
            MiningCandidate::new(id, timestamp, transactions, previous_hash, difficulty);

        // 정답을 찾을 때까지 큰 배치로 계속 시도한다.
        loop {
            if let Some(block) = candidate.try_batch(2_000_000) {
                println!(
                    "  ⛏  채굴 성공! nonce={}, 시도 횟수: {}, 거래 {}건",
                    block.nonce,
                    block.nonce + 1,
                    block.transactions.len()
                );
                return block;
            }
        }
    }

    // 거래 목록을 하나의 문자열로 변환 (해시 계산용)
    // 예: "Alice->Bob:10|Bob->Charlie:3|COINBASE->Miner:50"
    pub fn transactions_to_string(transactions: &[Transaction]) -> String {
        transactions
            .iter()
            .map(|tx| tx.to_hash_string())
            .collect::<Vec<String>>()
            .join("|")
    }

    // 해시 계산에 들어가는 "원본 입력 문자열"(preimage)을 만든다.
    // 화면에서 "이 문자열을 SHA-256에 넣습니다"를 보여줄 때 사용.
    pub fn hash_preimage(
        id: u64,
        timestamp: u64,
        tx_data: &str,
        previous_hash: &str,
        nonce: u64,
    ) -> String {
        format!("{id}{timestamp}{tx_data}{previous_hash}{nonce}")
    }

    pub fn calculate_hash(
        id: u64,
        timestamp: u64,
        tx_data: &str,
        previous_hash: &str,
        nonce: u64,
    ) -> String {
        let input = Block::hash_preimage(id, timestamp, tx_data, previous_hash, nonce);
        sha256_hex(&input)
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

// ============================================================
// 임의의 문자열을 SHA-256 16진수 문자열로 변환
// ============================================================
// 블록 해시뿐 아니라, 화면의 "SHA-256 놀이터"에서도 재사용한다.
pub fn sha256_hex(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();

    let mut hex_string = String::new();
    for byte in result {
        write!(hex_string, "{byte:02x}").expect("Failed to write hex");
    }
    hex_string
}

// ============================================================
// MiningCandidate — "채굴 중인 블록" (아직 정답 nonce를 못 찾은 상태)
// ============================================================
// 왜 필요한가?
//   기존 mine()은 정답을 찾을 때까지 멈추지 않고 루프를 돈다.
//   브라우저에서 이걸 그대로 돌리면 화면이 얼어붙는다(freeze).
//   그래서 "nonce를 몇 개씩만 시도하고 잠깐 양보"할 수 있도록
//   채굴 과정을 잘게 쪼갠 구조체를 만든다.
//
//   try_batch(n)을 호출하면 nonce를 n번 시도하고,
//     - 정답을 찾으면 Some(완성된 Block)을 돌려준다.
//     - 못 찾으면 None을 돌려주고, 다음 nonce부터 이어서 시도할 수 있다.
//
//   화면(JS)은 매 프레임마다 try_batch를 호출하면서
//   "지금 nonce는 몇이고, 해시는 뭐다"를 실시간으로 그릴 수 있다.
//   이게 바로 채굴(Proof of Work)이 "운 좋은 숫자 찾기 노가다"임을 체감하는 방법이다.
pub struct MiningCandidate {
    pub id: u64,
    pub timestamp: u64,
    pub transactions: Vec<Transaction>,
    pub previous_hash: String,
    pub difficulty: usize,

    // 현재까지 시도한 nonce (다음에 시도할 값)
    pub nonce: u64,
    // 마지막으로 계산한 해시 (화면 표시용)
    pub last_hash: String,

    // 미리 계산해 캐싱해두는 값들 (매 nonce마다 다시 만들 필요 없음)
    tx_data: String,
    target: String,
}

impl MiningCandidate {
    pub fn new(
        id: u64,
        timestamp: u64,
        transactions: Vec<Transaction>,
        previous_hash: String,
        difficulty: usize,
    ) -> Self {
        let tx_data = Block::transactions_to_string(&transactions);
        // 목표: 해시가 이 문자열("00...")로 시작해야 한다.
        let target = "0".repeat(difficulty);
        let last_hash = Block::calculate_hash(id, timestamp, &tx_data, &previous_hash, 0);

        MiningCandidate {
            id,
            timestamp,
            transactions,
            previous_hash,
            difficulty,
            nonce: 0,
            last_hash,
            tx_data,
            target,
        }
    }

    // nonce를 batch번 시도한다.
    // 정답(난이도 조건을 만족하는 해시)을 찾으면 완성된 Block을 반환.
    pub fn try_batch(&mut self, batch: u64) -> Option<Block> {
        for _ in 0..batch {
            let hash = Block::calculate_hash(
                self.id,
                self.timestamp,
                &self.tx_data,
                &self.previous_hash,
                self.nonce,
            );

            if hash.starts_with(&self.target) {
                self.last_hash = hash.clone();
                return Some(Block {
                    id: self.id,
                    timestamp: self.timestamp,
                    transactions: self.transactions.clone(),
                    previous_hash: self.previous_hash.clone(),
                    hash,
                    nonce: self.nonce,
                    difficulty: self.difficulty,
                });
            }

            self.last_hash = hash;
            self.nonce += 1;
        }
        None
    }

    // 지금 채굴 중인 블록의 해시 입력 문자열(preimage). 화면 표시용.
    pub fn preimage(&self) -> String {
        Block::hash_preimage(
            self.id,
            self.timestamp,
            &self.tx_data,
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
