// ============================================================
// merkle.rs — 머클트리 + double SHA-256
// ============================================================
// 비트코인 블록 하나에는 거래가 수천 건 들어갈 수 있다. 그런데 블록을
// 채굴(해시)할 때 그 수천 건을 매번 통째로 해시하면 너무 비싸다.
//
// 그래서 거래들을 "머클트리"로 압축해 단 하나의 32바이트 값
// (= 머클루트)으로 요약한다. 헤더에는 이 머클루트만 들어간다.
//
//   - 거래가 1건이라도 바뀌면 머클루트가 완전히 달라진다(변조 감지).
//   - 특정 거래가 블록에 들었는지, 전부 받지 않고도 증명할 수 있다(SPV).
//
// 비트코인의 해시는 거의 다 "double SHA-256" = SHA-256을 두 번 적용.

use sha2::{Digest, Sha256};
use std::fmt::Write as _;

// SHA-256을 두 번 적용한다. (비트코인 표준)
pub fn double_sha256(bytes: &[u8]) -> [u8; 32] {
    let first = Sha256::digest(bytes);
    let second = Sha256::digest(first);
    let mut out = [0u8; 32];
    out.copy_from_slice(&second);
    out
}

// SHA-256 한 번 (double의 중간 단계를 화면에 보여줄 때 사용)
pub fn sha256_once(bytes: &[u8]) -> [u8; 32] {
    let d = Sha256::digest(bytes);
    let mut out = [0u8; 32];
    out.copy_from_slice(&d);
    out
}

pub fn to_hex(bytes: &[u8]) -> String {
    let mut s = String::new();
    for b in bytes {
        let _ = write!(s, "{b:02x}");
    }
    s
}

// 거래 문자열들을 받아, 트리의 각 층(leaf→…→root)을 통째로 돌려준다.
// levels[0]            = 잎(각 거래의 double-SHA256)
// levels[last]         = [머클루트]  (원소 1개)
//
// 비트코인 규칙: 한 층의 노드 개수가 홀수이면 "마지막 노드를 복제"해
// 짝을 맞춘 뒤 둘을 이어붙여 부모 해시를 만든다.
pub fn merkle_levels(tx_data: &[String]) -> Vec<Vec<[u8; 32]>> {
    // 잎 = 각 거래의 double SHA-256
    let mut level: Vec<[u8; 32]> = if tx_data.is_empty() {
        vec![[0u8; 32]]
    } else {
        tx_data
            .iter()
            .map(|t| double_sha256(t.as_bytes()))
            .collect()
    };

    let mut levels = vec![level.clone()];

    while level.len() > 1 {
        let mut next = Vec::with_capacity((level.len() + 1) / 2);
        let mut i = 0;
        while i < level.len() {
            let left = level[i];
            // 홀수면 마지막 노드를 자기 자신과 짝지음
            let right = if i + 1 < level.len() {
                level[i + 1]
            } else {
                level[i]
            };
            let mut cat = Vec::with_capacity(64);
            cat.extend_from_slice(&left);
            cat.extend_from_slice(&right);
            next.push(double_sha256(&cat));
            i += 2;
        }
        levels.push(next.clone());
        level = next;
    }

    levels
}

pub fn merkle_root(tx_data: &[String]) -> [u8; 32] {
    let levels = merkle_levels(tx_data);
    levels.last().unwrap()[0]
}
