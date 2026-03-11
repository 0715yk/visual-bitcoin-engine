// ============================================================
// transaction.rs — 거래(Transaction) 구조체
// ============================================================
// 이전에는 "Alice -> Bob: 10 BTC" 같은 단순 문자열이었지만,
// 이제 보내는 사람, 받는 사람, 금액을 구조체로 관리한다.
//
// 실제 비트코인의 거래는 이것보다 훨씬 복잡하지만 (UTXO 모델),
// 핵심 개념을 이해하기 위한 단순화 버전이다.

// Debug: println!("{:?}") 가능
// Clone: .clone()으로 복사 가능
#[derive(Debug, Clone)]
pub struct Transaction {
    // 보내는 사람 (지갑 주소 또는 이름)
    // "COINBASE"이면 채굴 보상 거래 (새 코인 생성)
    pub from: String,

    // 받는 사람 (지갑 주소 또는 이름)
    pub to: String,

    // 보내는 금액 (BTC)
    // f64 = 소수점이 있는 숫자 (JavaScript의 number와 같다)
    pub amount: f64,
}

impl Transaction {
    // 일반 거래를 만든다
    pub fn new(from: &str, to: &str, amount: f64) -> Self {
        Transaction {
            from: from.to_string(),
            to: to.to_string(),
            amount,
        }
    }

    // 채굴 보상 거래 (Coinbase Transaction)
    // 비트코인에서 블록의 첫 번째 거래는 항상 이것이다.
    // 이전 소유자 없이 새로운 코인이 생성되는 특별한 거래.
    // from이 "COINBASE"인 것으로 구분한다.
    pub fn coinbase(to: &str, reward: f64) -> Self {
        Transaction {
            from: "COINBASE".to_string(),
            to: to.to_string(),
            amount: reward,
        }
    }

    // 채굴 보상 거래인지 확인
    pub fn is_coinbase(&self) -> bool {
        self.from == "COINBASE"
    }

    // 거래 내용을 해시 입력용 문자열로 변환
    // 블록의 해시를 계산할 때 거래 내용도 포함되어야 한다.
    pub fn to_hash_string(&self) -> String {
        format!("{}->{}:{}", self.from, self.to, self.amount)
    }
}

// Display — println!("{tx}") 할 때 출력 형식
impl std::fmt::Display for Transaction {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if self.is_coinbase() {
            // 채굴 보상 거래는 특별하게 표시
            write!(f, "[COINBASE] → {}: {} BTC", self.to, self.amount)
        } else {
            write!(f, "{} → {}: {} BTC", self.from, self.to, self.amount)
        }
    }
}
