// ============================================================
// block.rs — Block 구조체와 해시 계산을 담당하는 모듈
// ============================================================

use sha2::{Digest, Sha256};
use std::fmt::Write;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct Block {
    pub id: u64,
    pub timestamp: u64,
    pub data: String,
    pub previous_hash: String,
    pub hash: String,

    // [NEW] nonce (Number used ONCE) — 채굴에 쓰이는 숫자
    //
    // 채굴이란?
    //   "해시의 앞자리가 0000...으로 시작하는 값을 찾아라"라는 퍼즐을 푸는 것이다.
    //   블록의 내용(id, timestamp, data, previous_hash)은 정해져 있으니까
    //   바꿀 수 있는 건 이 nonce뿐이다.
    //
    //   nonce=0 → 해시: "a3f2b1..." → 0으로 안 시작함. 다음!
    //   nonce=1 → 해시: "7c91d4..." → 0으로 안 시작함. 다음!
    //   nonce=2 → 해시: "00003f..." → 0000으로 시작! 채굴 성공!
    //
    //   이 과정이 엄청난 계산을 필요로 하기 때문에
    //   블록을 만드는 데 "비용"이 들게 되고,
    //   조작하려면 이 비용을 다시 치러야 한다.
    pub nonce: u64,
}

impl Block {
    // new()는 이제 채굴 없이 기본 블록만 만든다 (제네시스 블록용)
    pub fn new(id: u64, data: String, previous_hash: String) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();

        let nonce = 0;
        let hash = Block::calculate_hash(id, timestamp, &data, &previous_hash, nonce);

        Block {
            id,
            timestamp,
            data,
            previous_hash,
            hash,
            nonce,
        }
    }

    // ============================================================
    // mine() — 채굴! nonce를 바꿔가며 조건에 맞는 해시를 찾는다.
    // ============================================================
    //
    // difficulty = 해시 앞에 와야 하는 0의 개수
    //   difficulty=1 → "0..."     으로 시작 (쉬움)
    //   difficulty=2 → "00..."    으로 시작
    //   difficulty=4 → "0000..."  으로 시작 (어려움)
    //   difficulty=6 → "000000..."으로 시작 (매우 어려움)
    //
    // 실제 비트코인은 difficulty가 약 19~20 정도이다. (2026년 기준)
    // 그래서 전 세계 채굴기가 약 10분에 하나 찾을까 말까 한 수준.
    pub fn mine(id: u64, data: String, previous_hash: String, difficulty: usize) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();

        // "0"을 difficulty 개수만큼 반복한 문자열을 만든다.
        // difficulty=4 → target = "0000"
        // 해시가 이 문자열로 시작해야 채굴 성공이다.
        // .repeat()은 JavaScript의 "0".repeat(4) 와 같다.
        let target = "0".repeat(difficulty);

        let mut nonce: u64 = 0;

        // 무한 반복: 조건에 맞는 해시를 찾을 때까지
        // loop는 JavaScript의 while(true)와 같다.
        loop {
            let hash = Block::calculate_hash(id, timestamp, &data, &previous_hash, nonce);

            // 해시가 target("0000...")으로 시작하는지 확인
            // .starts_with()는 JavaScript의 .startsWith()와 같다.
            if hash.starts_with(&target) {
                // 찾았다! 채굴 성공!
                println!("  ⛏  채굴 성공! nonce={nonce}, 시도 횟수: {}", nonce + 1);
                return Block {
                    id,
                    timestamp,
                    data,
                    previous_hash,
                    hash,
                    nonce,
                };
            }

            // 못 찾았으면 nonce를 1 올리고 다시 시도
            nonce += 1;
        }
    }

    // calculate_hash에 nonce도 포함시킨다.
    // nonce가 바뀌면 해시도 완전히 달라진다 — 이게 채굴의 핵심.
    pub fn calculate_hash(
        id: u64,
        timestamp: u64,
        data: &str,
        previous_hash: &str,
        nonce: u64,
    ) -> String {
        // nonce를 입력에 추가! 이제 nonce가 바뀌면 해시도 바뀐다.
        let input = format!("{id}{timestamp}{data}{previous_hash}{nonce}");

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
        Block::calculate_hash(
            self.id,
            self.timestamp,
            &self.data,
            &self.previous_hash,
            self.nonce,
        )
    }
}

// Display — 출력 형식 (nonce 정보도 추가)
impl std::fmt::Display for Block {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Block #{} [hash: {}... | nonce: {} | data: \"{}\"]",
            self.id,
            &self.hash[..16],
            self.nonce,
            self.data
        )
    }
}
