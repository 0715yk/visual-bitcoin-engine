// ============================================================
// header.rs — 비트코인 블록 헤더(80바이트) + target 난이도 + 채굴
// ============================================================
// 진짜 비트코인이 채굴할 때 해시하는 건 "거래 전체"가 아니라
// 딱 80바이트짜리 "블록 헤더"다. 헤더는 6개 필드로 이루어진다:
//
//   version       4바이트   블록 규칙 버전
//   prev_hash    32바이트   직전 블록 헤더의 해시 (← 체인을 잇는 고리)
//   merkle_root  32바이트   이 블록 거래들의 머클루트 (← 거래 요약)
//   timestamp     4바이트   생성 시각(유닉스 초)
//   bits          4바이트   목표 난이도(target)를 압축한 값
//   nonce         4바이트   채굴자가 바꿔보는 숫자  ← "노가다" 대상
//
// 블록 해시 = double_sha256(이 80바이트)
//
// 그리고 난이도는 "0이 몇 개"가 아니라 "target이라는 256비트 숫자보다
// 작거나 같아야 한다"로 판정한다. 즉:  블록해시(숫자) <= target(숫자)
// target이 작을수록(=앞에 0이 많을수록) 만족하는 해시가 드물어 더 어렵다.

use crate::merkle::{double_sha256, merkle_root};
use crate::time::now_secs;

pub struct BlockHeader {
    pub version: u32,
    pub prev_hash: [u8; 32],
    pub merkle_root: [u8; 32],
    pub timestamp: u32,
    // 교육용: 실제 비트코인의 nBits 대신 "목표로 하는 선행 0비트 수"를 담는다.
    // (target = 2^(256 - zero_bits) - 1 로 환산)
    pub zero_bits: u32,
    pub nonce: u32,
}

impl BlockHeader {
    // 헤더를 80바이트로 직렬화한다. (정수는 리틀엔디안 — 비트코인 방식)
    pub fn serialize(&self) -> Vec<u8> {
        let mut v = Vec::with_capacity(80);
        v.extend_from_slice(&self.version.to_le_bytes()); // 4
        v.extend_from_slice(&self.prev_hash); // 32
        v.extend_from_slice(&self.merkle_root); // 32
        v.extend_from_slice(&self.timestamp.to_le_bytes()); // 4
        v.extend_from_slice(&self.zero_bits.to_le_bytes()); // 4 (nBits 자리)
        v.extend_from_slice(&self.nonce.to_le_bytes()); // 4
        v
    }

    // 블록 해시 = double SHA-256(헤더 80바이트)
    pub fn hash(&self) -> [u8; 32] {
        double_sha256(&self.serialize())
    }
}

// 선행 0비트 수로부터 target(256비트 임계값)을 만든다.
// target = 2^(256 - zero_bits) - 1  →  앞쪽 zero_bits 비트가 0, 나머지는 1.
// 블록해시 <= target  ⟺  블록해시의 앞 zero_bits 비트가 모두 0.
pub fn target_from_zero_bits(zero_bits: u32) -> [u8; 32] {
    let z = zero_bits.min(256);
    let mut t = [0xffu8; 32];
    let full_zero_bytes = (z / 8) as usize;
    let rem = z % 8;
    for byte in t.iter_mut().take(full_zero_bytes) {
        *byte = 0;
    }
    if full_zero_bytes < 32 && rem > 0 {
        t[full_zero_bytes] = 0xffu8 >> rem;
    }
    t
}

// 빅엔디안 256비트 숫자 비교: hash <= target ?
pub fn meets_target(hash: &[u8; 32], target: &[u8; 32]) -> bool {
    hash <= target
}

// ============================================================
// HeaderMiner — 헤더의 nonce를 바꿔가며 target을 만족하는 해시 찾기
// ============================================================
pub struct HeaderMiner {
    pub header: BlockHeader,
    pub target: [u8; 32],
    pub last_hash: [u8; 32],
    pub solved: bool,
}

impl HeaderMiner {
    pub fn new(version: u32, prev_hash: [u8; 32], tx_data: &[String], zero_bits: u32) -> Self {
        let header = BlockHeader {
            version,
            prev_hash,
            merkle_root: merkle_root(tx_data),
            timestamp: now_secs() as u32,
            zero_bits,
            nonce: 0,
        };
        let target = target_from_zero_bits(zero_bits);
        let last_hash = header.hash();
        HeaderMiner {
            header,
            target,
            last_hash,
            solved: false,
        }
    }

    // nonce를 batch번 시도. 정답을 찾으면 true(이때 header.nonce/last_hash가 정답).
    pub fn try_batch(&mut self, batch: u32) -> bool {
        for _ in 0..batch {
            let hash = self.header.hash();
            self.last_hash = hash;
            if meets_target(&hash, &self.target) {
                self.solved = true;
                return true;
            }
            // nonce 소진 시(작은 난이도에선 사실상 안 일어남) 타임스탬프를 올려 탐색공간 확장
            if self.header.nonce == u32::MAX {
                self.header.nonce = 0;
                self.header.timestamp = self.header.timestamp.wrapping_add(1);
            } else {
                self.header.nonce += 1;
            }
        }
        false
    }
}
