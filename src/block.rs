// ============================================================
// block.rs — Block 구조체와 해시 계산을 담당하는 모듈
// ============================================================
// JavaScript로 치면 block.js 파일을 만들고
// export class Block { ... } 하는 것과 같다.

use sha2::{Digest, Sha256};
use std::fmt::Write;
use std::time::{SystemTime, UNIX_EPOCH};

// pub = public의 줄임말.
// 다른 파일(모듈)에서도 이 구조체를 쓸 수 있게 공개한다.
// JavaScript의 export와 같다.
// pub을 안 붙이면 이 파일 안에서만 쓸 수 있다 (private).
#[derive(Debug, Clone)]
pub struct Block {
    pub id: u64,
    pub timestamp: u64,
    pub data: String,
    pub previous_hash: String,
    pub hash: String,
}

impl Block {
    // pub fn = 외부에서 호출할 수 있는 공개 함수
    pub fn new(id: u64, data: String, previous_hash: String) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();

        let hash = Block::calculate_hash(id, timestamp, &data, &previous_hash);

        Block {
            id,
            timestamp,
            data,
            previous_hash,
            hash,
        }
    }

    // calculate_hash() — 블록의 내용을 SHA-256 해시로 변환한다.
    //
    // SHA-256이 하는 일:
    //   어떤 데이터든 넣으면 → 항상 64자리 16진수 문자열이 나온다.
    //   1글자만 바꿔도 결과가 완전히 달라진다.
    //   같은 입력이면 항상 같은 결과가 나온다.
    pub fn calculate_hash(id: u64, timestamp: u64, data: &str, previous_hash: &str) -> String {
        let input = format!("{id}{timestamp}{data}{previous_hash}");

        let mut hasher = Sha256::new();
        hasher.update(input.as_bytes());
        let result = hasher.finalize();

        // 바이트 배열 → 16진수 문자열 변환
        // {:02x} → 각 바이트를 2자리 16진수로 (예: 255 → "ff")
        let mut hex_string = String::new();
        for byte in result {
            write!(hex_string, "{byte:02x}").expect("Failed to write hex");
        }

        hex_string
    }

    // recalculate_hash() — 현재 블록의 필드들로 해시를 다시 계산한다.
    // 검증할 때 사용: "저장된 해시"와 "다시 계산한 해시"가 같은지 비교.
    // 조작되었으면 두 값이 달라진다.
    pub fn recalculate_hash(&self) -> String {
        Block::calculate_hash(self.id, self.timestamp, &self.data, &self.previous_hash)
    }
}

// Display — println!("{block}") 할 때 출력 형식 정의
impl std::fmt::Display for Block {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Block #{} [hash: {}... | data: \"{}\"]",
            self.id,
            &self.hash[..16],
            self.data
        )
    }
}
