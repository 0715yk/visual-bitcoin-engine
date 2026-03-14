// ============================================================
// transaction.rs — UTXO 기반 거래 시스템
// ============================================================
//
// [이전] 계좌(Account) 모델:
//   Transaction { from: "Alice", to: "Bob", amount: 10.0 }
//   → 은행처럼 잔액에서 차감
//
// [지금] UTXO(Unspent Transaction Output) 모델:
//   → 현금/쿠폰처럼 "사용"하고 "새로 발행"
//
// 비유: 만원짜리로 7천원짜리 물건을 사면
//   1. 만원짜리 쿠폰을 "사용"(파기)
//   2. 7천원짜리 쿠폰을 상대에게 발행
//   3. 3천원짜리 쿠폰을 나에게 발행 (거스름돈)
//   4. 거스름돈 쿠폰을 안 만들면? → 그 차이가 채굴자 수수료!

use crate::wallet::Wallet;
use sha2::{Digest, Sha256};
use std::fmt::Write;

// ============================================================
// TxInput — 이전 거래의 출력을 "사용"하겠다는 참조
// ============================================================
// 쿠폰을 내미는 것. "이 거래의 이 출력을 쓰겠다"
#[derive(Debug, Clone)]
pub struct TxInput {
    // 어떤 거래의 출력을 참조하는지
    pub tx_id: String,

    // 그 거래의 몇 번째 출력(쿠폰)인지 (0부터 시작)
    pub output_index: usize,

    // 디지털 서명 — "이 쿠폰의 주인이 나다"를 증명
    // 서명 전에는 빈 문자열, sign_input()으로 채운다
    pub signature: String,

    // 서명 검증에 쓸 공개키 (= 보내는 사람의 지갑 주소)
    pub public_key: String,
}

// ============================================================
// TxOutput — 새로 발행되는 "쿠폰"
// ============================================================
// 거래가 블록에 포함되면 이 출력들이 UTXO Set에 추가된다.
// 누군가 이 출력을 input으로 참조해서 쓰면 UTXO Set에서 제거된다.
#[derive(Debug, Clone)]
pub struct TxOutput {
    // 금액 (BTC)
    pub amount: f64,

    // 받는 사람의 공개키(지갑 주소)
    // 이 공개키의 개인키를 가진 사람만 이 쿠폰을 "사용"할 수 있다
    pub recipient: String,
}

// ============================================================
// Transaction — UTXO 기반 거래
// ============================================================
#[derive(Debug, Clone)]
pub struct Transaction {
    // 거래 ID — 거래 내용의 SHA-256 해시
    // TxInput에서 이 ID로 이전 거래를 참조한다
    pub id: String,

    // 사용할 쿠폰들 (이전 거래의 출력 참조)
    // 코인베이스 거래는 inputs가 비어있다
    pub inputs: Vec<TxInput>,

    // 새로 발행할 쿠폰들
    // outputs[0] = 상대에게 보내는 금액
    // outputs[1] = 나에게 돌아오는 거스름돈 (있다면)
    // sum(inputs) - sum(outputs) = 채굴자 수수료!
    pub outputs: Vec<TxOutput>,
}

impl Transaction {
    /// 일반 거래 생성 (서명은 아직 비어있다 — sign_input()으로 채워야 함)
    pub fn new(inputs: Vec<TxInput>, outputs: Vec<TxOutput>) -> Self {
        let mut tx = Transaction {
            id: String::new(),
            inputs,
            outputs,
        };
        tx.id = tx.calculate_id();
        tx
    }

    /// 코인베이스 거래 — 채굴 보상 (비트코인이 세상에 나오는 유일한 방법)
    ///
    /// inputs가 비어있다! 이전 소유자 없이 새 코인이 생성된다.
    /// 블록의 첫 번째 거래는 항상 이것이다.
    pub fn coinbase(to: &str, reward: f64) -> Self {
        let mut tx = Transaction {
            id: String::new(),
            inputs: vec![],
            outputs: vec![TxOutput {
                amount: reward,
                recipient: to.to_string(),
            }],
        };
        tx.id = tx.calculate_id();
        tx
    }

    /// 코인베이스 거래인지 확인
    pub fn is_coinbase(&self) -> bool {
        self.inputs.is_empty()
    }

    /// 수수료 계산 — input 합계와 output 합계를 받아서 차이를 구한다
    ///
    /// 거래 자체는 input이 참조하는 UTXO의 금액을 모른다.
    /// (금액은 UTXO Set에 있으므로) 그래서 input_sum을 외부에서 받는다.
    pub fn fee(&self, input_sum: f64) -> f64 {
        let output_sum: f64 = self.outputs.iter().map(|o| o.amount).sum();
        input_sum - output_sum
    }

    /// output 합계
    pub fn output_sum(&self) -> f64 {
        self.outputs.iter().map(|o| o.amount).sum()
    }

    /// 특정 input에 서명 — 지갑의 개인키로 "이 쿠폰은 내 것"을 증명
    ///
    /// 서명 대상: 거래 ID (= 거래 내용의 해시)
    /// 이렇게 하면 거래 내용이 변경되면 서명이 무효가 된다.
    pub fn sign_input(&mut self, index: usize, wallet: &Wallet) {
        let message = &self.id;
        self.inputs[index].signature = wallet.sign(message);
        self.inputs[index].public_key = wallet.public_key.clone();
    }

    /// 모든 input에 같은 지갑으로 서명 (편의 메서드)
    pub fn sign_all_inputs(&mut self, wallet: &Wallet) {
        for i in 0..self.inputs.len() {
            self.sign_input(i, wallet);
        }
    }

    /// 거래 ID 계산 — 거래 내용의 SHA-256 해시
    fn calculate_id(&self) -> String {
        let data = self.to_hash_string();
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        let result = hasher.finalize();

        let mut hex = String::new();
        for byte in result {
            write!(hex, "{byte:02x}").expect("Failed to write hex");
        }
        hex
    }

    /// 해시 입력용 문자열
    pub fn to_hash_string(&self) -> String {
        let inputs_str: String = self
            .inputs
            .iter()
            .map(|i| format!("{}:{}", i.tx_id, i.output_index))
            .collect::<Vec<_>>()
            .join(",");

        let outputs_str: String = self
            .outputs
            .iter()
            .map(|o| format!("{}:{}", o.recipient, o.amount))
            .collect::<Vec<_>>()
            .join(",");

        format!("in[{inputs_str}]out[{outputs_str}]")
    }
}

// Display — 거래 출력 형식
impl std::fmt::Display for Transaction {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if self.is_coinbase() {
            let out = &self.outputs[0];
            write!(
                f,
                "[COINBASE] → {}...: {} BTC",
                &out.recipient[..16.min(out.recipient.len())],
                out.amount
            )
        } else {
            let in_count = self.inputs.len();
            let out_parts: Vec<String> = self
                .outputs
                .iter()
                .map(|o| {
                    format!(
                        "{}...: {} BTC",
                        &o.recipient[..16.min(o.recipient.len())],
                        o.amount
                    )
                })
                .collect();

            write!(f, "[{}개 input] → {}", in_count, out_parts.join(", "))
        }
    }
}
