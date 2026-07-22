// ============================================================
// keccak.rs — Keccak-256 (이더리움 주소·해시 교육용)
// ============================================================
// 비트코인의 SHA-256과 대비: ETH는 Keccak-256을 쓴다.
// (NIST SHA-3와 패딩이 다르므로 "keccak-256"으로 표기)

use sha3::{Digest, Keccak256};

/// 임의 바이트 → Keccak-256 hex (64자)
pub fn keccak256_hex(data: &[u8]) -> String {
    let hash = Keccak256::digest(data);
    hex_encode(&hash)
}

/// UTF-8 문자열 → Keccak-256 hex
pub fn keccak256_str(s: &str) -> String {
    keccak256_hex(s.as_bytes())
}

/// 공개키 바이트(압축/비압축 무관하게 raw)의 Keccak-256 뒤 20바이트 → 0x 주소
/// 교육용: 입력 문자열을 "공개키 대용"으로 해시해 주소를 만든다.
pub fn address_from_label(label: &str) -> String {
    let hash = Keccak256::digest(label.as_bytes());
    let last20 = &hash[12..];
    format!("0x{}", hex_encode(last20))
}

/// CREATE 규칙 근사: keccak(deployer_addr ‖ nonce) 끝 20바이트.
/// (실제는 RLP([sender, nonce]) 를 해시하지만 구조는 동일: 배포자+nonce → 주소)
pub fn contract_address(deployer_addr: &str, nonce: u64) -> String {
    let pre = format!("{}:{}", deployer_addr, nonce);
    let hash = Keccak256::digest(pre.as_bytes());
    format!("0x{}", hex_encode(&hash[12..]))
}

fn hex_encode(bytes: &[u8]) -> String {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    let mut out = String::with_capacity(bytes.len() * 2);
    for &b in bytes {
        out.push(HEX[(b >> 4) as usize] as char);
        out.push(HEX[(b & 0xf) as usize] as char);
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_keccak() {
        // Keccak-256("") known value
        assert_eq!(
            keccak256_str(""),
            "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
        );
    }

    #[test]
    fn address_prefix() {
        let a = address_from_label("Alice");
        assert!(a.starts_with("0x"));
        assert_eq!(a.len(), 42);
    }
}
