// ============================================================
// wallet.rs — 지갑 (공개키/개인키 + 디지털 서명)
// ============================================================
//
// 현재까지의 문제: Transaction::new("Alice", "Bob", 10.0) 한 줄이면
// 누구나 Alice인 척 거래를 만들 수 있었다. 실제 비트코인에서는
// **개인키로 서명**해야만 유효한 거래가 된다.
//
// 비트코인이 사용하는 암호학:
//   - 타원곡선: secp256k1
//   - 서명 알고리즘: ECDSA (Elliptic Curve Digital Signature Algorithm)
//
// 자물쇠/열쇠 비유:
//   - 공개키 = 자물쇠 (누구나 볼 수 있고, 잠글 수 있다)
//   - 개인키 = 열쇠 (나만 가지고 있고, 열 수 있다)
//   - 서명 = "이 열쇠로 열었다"는 증거 (열쇠 자체를 보여주지 않고!)

use k256::ecdsa::signature::{Signer, Verifier};
use k256::ecdsa::{Signature, SigningKey, VerifyingKey};
use rand::rngs::OsRng;
use sha2::{Digest, Sha256};
use std::fmt::Write;

pub struct Wallet {
    // 개인키 — 절대 외부에 노출하면 안 된다!
    // 이것을 잃어버리면 코인을 영원히 못 쓴다.
    // 이것이 유출되면 코인을 전부 도둑맞는다.
    signing_key: SigningKey,

    // 공개키 — 지갑 주소로 사용 (hex 문자열)
    // 실제 비트코인은 공개키를 RIPEMD-160 + Base58Check으로 변환하지만
    // 교육용으로 hex 문자열을 그대로 사용한다.
    pub public_key: String,

    // 사람이 읽기 쉬운 이름 (교육용)
    pub name: String,
}

impl Wallet {
    /// 새 지갑 생성 — 개인키/공개키 쌍을 만든다.
    /// OsRng = 운영체제의 안전한 난수 생성기 (crypto-secure)
    pub fn new(name: &str) -> Self {
        let signing_key = SigningKey::random(&mut OsRng);
        let verifying_key = VerifyingKey::from(&signing_key);

        // 공개키를 압축 형태(33바이트)의 hex 문자열로 변환
        // to_encoded_point(true) = 압축(compressed) SEC1 인코딩
        let encoded_point = verifying_key.to_encoded_point(true);
        let public_key = hex_encode(encoded_point.as_bytes());

        println!("  [WALLET] {} 지갑 생성! 주소: {}...", name, &public_key[..16]);

        Wallet {
            signing_key,
            public_key,
            name: name.to_string(),
        }
    }

    /// 메시지에 서명 — 개인키로 "이건 내가 보낸 거다"를 증명
    ///
    /// 서명 과정:
    /// 1. 메시지를 SHA-256으로 해시
    /// 2. 해시값에 개인키로 ECDSA 서명
    /// 3. 서명을 hex 문자열로 반환
    ///
    /// 핵심: 개인키 자체는 절대 전송되지 않는다!
    /// 서명만 보내도 "이 사람이 맞다"를 수학적으로 증명할 수 있다.
    pub fn sign(&self, message: &str) -> String {
        let digest = sha256_hash(message);
        let signature: Signature = self.signing_key.sign(digest.as_bytes());
        let sig_bytes = signature.to_bytes();
        hex_encode(sig_bytes.as_slice())
    }

    /// 서명 검증 — 공개키로 "이 서명이 진짜인지" 확인
    ///
    /// 검증에 필요한 것: 공개키 + 원본 메시지 + 서명
    /// 개인키는 필요 없다! (그래서 "공개"키)
    pub fn verify(public_key_hex: &str, message: &str, signature_hex: &str) -> bool {
        let Ok(pub_key_bytes) = hex_decode(public_key_hex) else {
            return false;
        };
        let Ok(verifying_key) = VerifyingKey::from_sec1_bytes(&pub_key_bytes) else {
            return false;
        };
        let Ok(sig_bytes) = hex_decode(signature_hex) else {
            return false;
        };
        let Ok(signature) = Signature::from_slice(&sig_bytes) else {
            return false;
        };

        let digest = sha256_hash(message);
        verifying_key.verify(digest.as_bytes(), &signature).is_ok()
    }

    /// 공개키의 앞 8자리 — 출력용 단축 주소
    pub fn short_address(&self) -> &str {
        &self.public_key[..16]
    }
}

// ============================================================
// 헬퍼 함수들
// ============================================================

/// 바이트 배열 → hex 문자열
fn hex_encode(bytes: &[u8]) -> String {
    let mut s = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        write!(s, "{byte:02x}").expect("Failed to write hex");
    }
    s
}

/// hex 문자열 → 바이트 배열
fn hex_decode(hex: &str) -> Result<Vec<u8>, String> {
    if hex.len() % 2 != 0 {
        return Err("Hex string must have even length".to_string());
    }
    (0..hex.len())
        .step_by(2)
        .map(|i| {
            u8::from_str_radix(&hex[i..i + 2], 16)
                .map_err(|e| format!("Invalid hex at position {i}: {e}"))
        })
        .collect()
}

/// SHA-256 해시 → hex 문자열
fn sha256_hash(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    hex_encode(&hasher.finalize())
}
