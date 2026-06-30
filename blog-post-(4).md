# 프론트엔드 개발자가 Rust로 비트코인 지갑과 UTXO를 직접 구현해봤다

> 비트코인 시각화 프로젝트 4편 — 디지털 서명, UTXO 모델, 수수료 시스템

## 이전 글 요약

[3편](https://velog.io/@0715yk)에서는 거래(Transaction)를 구조화하고, 잔액 검증과 멤풀을 구현했다. 그리고 "실제 비트코인은 잔액이 아니라 쿠폰(UTXO)이다"라는 이야기를 했었다. 이번 편에서는:

1. **지갑(Wallet)** — 공개키/개인키로 "이 거래를 보낸 게 진짜 나다" 증명
2. **UTXO 모델** — 계좌 차감이 아니라 쿠폰 교환 방식으로 전면 교체
3. **수수료 시스템** — 거스름돈을 안 받으면 채굴자 보너스
4. **위조 방지 데모** — 해커가 서명 없이/다른 키로 거래를 시도하면?

---

## 문제 제기: 아무나 Alice인 척 할 수 있다

3편까지의 코드에는 치명적인 허점이 있었다:

```rust
// 누구나 이 한 줄로 Alice인 척 거래를 만들 수 있다!
Transaction::new("Alice", "Bob", 10.0)
```

본인 인증이 전혀 없다. 이름만 적으면 그 사람이 되는 셈이다. 실제 비트코인에서는 **개인키로 서명**해야만 유효한 거래가 된다. 서명이 없거나 잘못된 서명이면 네트워크에서 바로 거부한다.

---

## 공개키 암호학 — 자물쇠와 열쇠

비트코인의 서명 시스템을 이해하려면 **공개키 암호학**을 알아야 한다. 비유하면:

```
개인키 = 열쇠 (나만 가지고 있다)
공개키 = 자물쇠 (누구나 볼 수 있다)
서명 = "이 열쇠로 열었다"는 증거 (열쇠 자체를 보여주지 않고!)
```

핵심은 **개인키 없이 서명을 만들 수 없지만, 공개키만으로 서명을 검증할 수 있다**는 것이다.

실생활 비유: 인감도장 vs 인감증명서

```
개인키 = 인감도장 (나만 소유, 절대 남에게 안 줌)
공개키 = 인감증명서 (관공서에서 발급, 누구나 확인 가능)
서명 = 인감이 찍힌 서류 (도장 자체를 주지 않아도 "이 사람이 맞다" 증명)
```

---

## secp256k1 — 비트코인이 선택한 타원곡선

비트코인은 **secp256k1**이라는 타원곡선을 사용한다. 이름이 무섭게 생겼지만:

```
sec = Standards for Efficient Cryptography
p = 소수 기반 (prime)
256 = 256비트
k = Koblitz 곡선
1 = 첫 번째 파라미터 세트
```

타원곡선의 핵심 성질:

```
"곱하기"는 쉬운데, "나누기"는 사실상 불가능하다.

개인키 × 기준점 = 공개키   ← 이건 쉽다 (컴퓨터로 즉시)
공개키 ÷ 기준점 = 개인키   ← 이건 불가능 (우주가 끝날 때까지 못 풀음)
```

이 "일방향성" 덕분에 개인키에서 공개키를 만들 수 있지만, 공개키에서 개인키를 알아낼 수 없다. 비트코인의 보안이 여기에 달려있다.

Rust에서는 `k256` 크레이트로 구현한다:

```rust
// Cargo.toml
k256 = { version = "0.13", features = ["ecdsa"] }
rand = "0.8"
```

---

## Wallet 구현 — 키 생성, 서명, 검증

```rust
pub struct Wallet {
    signing_key: SigningKey,   // 개인키 (비밀!)
    pub public_key: String,   // 공개키 (= 지갑 주소)
    pub name: String,         // 사람이 읽을 수 있는 이름 (교육용)
}
```

### 키 생성

```rust
let signing_key = SigningKey::random(&mut OsRng);
let verifying_key = VerifyingKey::from(&signing_key);
let public_key = hex_encode(verifying_key.to_encoded_point(true).as_bytes());
```

`OsRng`은 운영체제의 안전한 난수 생성기다. `/dev/urandom`(Linux)이나 `BCryptGenRandom`(Windows)을 사용한다. `Math.random()`과는 차원이 다른 보안 수준.

### 서명

```rust
pub fn sign(&self, message: &str) -> String {
    let digest = sha256_hash(message);
    let signature: Signature = self.signing_key.sign(digest.as_bytes());
    hex_encode(signature.to_bytes().as_slice())
}
```

과정: 메시지 → SHA-256 해시 → 해시에 개인키로 ECDSA 서명 → hex 문자열

**핵심: 개인키 자체는 절대 전송되지 않는다!** 서명만 보내도 "이 사람이 맞다"를 수학적으로 증명할 수 있다.

### 검증

```rust
pub fn verify(public_key_hex: &str, message: &str, signature_hex: &str) -> bool {
    // 공개키 복원 → 서명 복원 → 메시지 해시 → 검증
    verifying_key.verify(digest.as_bytes(), &signature).is_ok()
}
```

검증에 필요한 것: **공개키 + 원본 메시지 + 서명** (개인키는 필요 없다!)

---

## UTXO 모델 — 계좌가 아니라 쿠폰이다

3편에서 설명만 했던 UTXO를 드디어 구현했다. 전체 거래 구조가 바뀌었다.

### 이전 vs 지금

```rust
// [이전] 계좌 모델 — 은행처럼 잔액 차감
Transaction {
    from: "Alice",
    to: "Bob",
    amount: 10.0,
}

// [지금] UTXO 모델 — 쿠폰 교환
Transaction {
    inputs: vec![TxInput { tx_id: "abc...", output_index: 0, ... }],
    outputs: vec![
        TxOutput { amount: 10.0, recipient: "Bob의 공개키" },
        TxOutput { amount: 2.0, recipient: "Alice의 공개키" },  // 거스름돈!
    ],
}
```

### 쿠폰 교환의 전체 과정

만원짜리 지폐로 7천원짜리 물건을 사는 것과 같다:

```
Alice의 UTXO: [12 BTC 쿠폰]

Alice가 Bob에게 10 BTC를 보내려면:
  1. 12 BTC 쿠폰을 "사용"(파기)         ← TxInput
  2. Bob에게 10 BTC 새 쿠폰 발행        ← TxOutput[0]
  3. Alice에게 2 BTC 거스름돈 쿠폰 발행  ← TxOutput[1]

결과: 12 BTC 쿠폰 사라짐, 10 BTC + 2 BTC 쿠폰 생김
```

### TxInput — 쿠폰을 내미는 것

```rust
pub struct TxInput {
    pub tx_id: String,       // 어떤 거래의
    pub output_index: usize, // 몇 번째 출력(쿠폰)을
    pub signature: String,   // 내가 주인이라는 서명
    pub public_key: String,  // 서명 검증용 공개키
}
```

`tx_id`와 `output_index`로 "이 쿠폰을 쓰겠다"고 지정한다. `signature`로 "이 쿠폰의 주인이 나다"를 증명한다.

### TxOutput — 새 쿠폰 발행

```rust
pub struct TxOutput {
    pub amount: f64,       // 금액
    pub recipient: String, // 받는 사람의 공개키
}
```

이 출력이 블록에 포함되면 UTXO Set에 추가된다. 누군가 이것을 TxInput으로 참조해서 쓰면 UTXO Set에서 사라진다.

### UTXO Set — 미사용 쿠폰 목록

```rust
// 이전: 계좌 잔액
balances: HashMap<String, f64>
// { "Alice": 12.0, "Bob": 5.0 }

// 지금: 미사용 쿠폰 목록
utxo_set: HashMap<(String, usize), TxOutput>
// { ("tx_abc", 0): TxOutput { amount: 12.0, recipient: "Alice" } }
```

"잔액"이라는 필드는 어디에도 없다. 잔액을 알고 싶으면 UTXO Set에서 내 주소로 된 쿠폰을 전부 더하는 것이다.

```rust
pub fn get_balance(&self, address: &str) -> f64 {
    self.utxo_set.values()
        .filter(|output| output.recipient == address)
        .map(|output| output.amount)
        .sum()
}
```

실제 비트코인 노드도 이 UTXO Set을 `chainstate`라는 DB에 캐싱한다. 2024년 기준 약 7천만 개의 UTXO가 존재한다.

---

## 수수료 — 거스름돈을 안 받으면 채굴자 보너스

UTXO 모델에서 수수료는 별도 필드가 아니다. **input 합계 - output 합계 = 수수료**다.

```
Input:  12 BTC 쿠폰
Output: 10 BTC (Bob에게) + 1.5 BTC (거스름돈)
수수료: 12 - 11.5 = 0.5 BTC (채굴자에게!)
```

거스름돈 출력을 안 만들면? 그 차이가 전부 채굴자에게 간다. 실수로 거스름돈을 안 적으면 큰 손해!

```
Input:  12 BTC 쿠폰
Output: 10 BTC (Bob에게)
수수료: 12 - 10 = 2 BTC (!!! 실수로 2 BTC를 채굴자에게 기부)
```

### 수수료 우선순위

채굴자는 수수료가 높은 거래부터 블록에 넣는다. 바이낸스에서 출금할 때 "네트워크 수수료"를 선택하는 게 이것이다:

```rust
fn sort_pending_by_fee(&mut self) {
    // 수수료 높은 순으로 정렬
    self.pending_transactions.sort_by(|a, b| {
        fee_b.partial_cmp(&fee_a)  // 내림차순
    });
}
```

수수료를 0으로 하면? 아무도 내 거래를 블록에 안 넣어줘서 영원히 멤풀에 갇힌다. 실제로 비트코인 네트워크가 바쁠 때 수수료가 치솟는 이유가 이것이다.

---

## 위조 방지 — 서명 없이는 불가능!

이제 해커(Eve)가 남의 비트코인을 훔치려고 시도하면 어떻게 되는지 보자.

### 공격 1: 다른 사람의 UTXO를 쓰려고 한다

```rust
// Eve가 Alice의 UTXO를 참조하고, 자기 키로 서명한다
let mut fake_tx = Transaction::new(
    vec![TxInput {
        tx_id: alice_utxo_id,
        output_index: 0,
        signature: String::new(),
        public_key: eve_wallet.public_key.clone(),  // Eve의 공개키
    }],
    vec![TxOutput { amount: 4.0, recipient: eve_wallet.public_key.clone() }],
);
fake_tx.sign_all_inputs(&eve_wallet);  // Eve가 자기 키로 서명
```

결과:

```
[REJECTED] 공개키 불일치! 이 UTXO의 소유자가 아닙니다
```

UTXO의 `recipient`(Alice의 공개키)와 input의 `public_key`(Eve의 공개키)가 다르므로 즉시 거부된다.

### 공격 2: 서명 없이 보낸다

```
[REJECTED] 서명 검증 실패! 위조된 거래입니다
```

### 공격 3: 잔액보다 많이 보낸다

```
[REJECTED] 잔액 부족! 보유: 4.90 BTC, 필요: 100.10 BTC
```

**3중 방어:**
1. 공개키가 UTXO 소유자와 일치해야 한다
2. 개인키로 정당한 서명을 해야 한다
3. 가진 UTXO 합계 이상을 보낼 수 없다

---

## 양자컴퓨터 위협

3편에서 예고했던 내용. 비트코인의 보안은 "공개키에서 개인키를 역산하는 것은 불가능하다"는 전제에 의존한다. 하지만 양자컴퓨터의 **쇼어 알고리즘(Shor's Algorithm)**은 이 역산을 이론적으로 가능하게 만든다.

```
현재 컴퓨터: 공개키 → 개인키 = 10^30년 (우주 나이보다 김)
양자컴퓨터:  공개키 → 개인키 = 수 시간? (이론상)
```

그래서 비트코인은 공개키를 한 번 더 해싱해서 주소로 만든다:

```
개인키 → 공개키 → SHA-256 → RIPEMD-160 → 비트코인 주소
```

공개키가 직접 노출되지 않으면 양자컴퓨터도 무력하다. 하지만 **거래를 보내는 순간** 공개키가 블록체인에 공개되므로, 그 사이에 양자컴퓨터가 개인키를 알아낼 수 있다면 위험하다.

현재(2026년)로서는 비트코인을 위협할 수준의 양자컴퓨터는 존재하지 않지만, 연구는 계속 진행 중이다. 비트코인 커뮤니티에서도 양자 내성 서명(post-quantum signature)으로의 전환을 논의하고 있다.

우리 코드에서는 교육용으로 공개키를 그대로 주소로 쓰고 있지만, 실제 비트코인은 이런 추가 해싱을 통해 한 겹 더 보호하고 있다.

---

## Rust에서 배운 것

### Result — 에러를 무시할 수 없는 언어

```rust
// JavaScript: 에러 처리를 안 해도 컴파일됨
const key = parseKey(data); // 실패하면? undefined? null? 런타임 폭발?

// Rust: Result를 처리하지 않으면 컴파일 자체가 안 됨
let Ok(key) = parse_key(data) else {
    return false;  // 에러 경로를 반드시 처리해야 함
};
```

`Wallet::verify()`에서 hex 디코딩, 공개키 복원, 서명 복원이 모두 실패할 수 있다. Rust는 이 모든 경우를 명시적으로 처리하게 강제한다. 처음엔 번거로웠지만, "에러가 발생할 수 있다"는 것을 코드에서 바로 알 수 있어서 오히려 읽기 편하다.

### HashMap과 Entry API

```rust
// JavaScript
const balance = map.get(address) ?? 0;

// Rust — 비슷하지만 참조 vs 값의 구분이 명확
*self.balances.get(address).unwrap_or(&0.0)

// Entry API — 있으면 가져오고, 없으면 넣고 가져온다
let entry = self.balances.entry(key.clone()).or_insert(0.0);
*entry += amount;
```

### iter + filter_map + sum — 함수형 체이닝

```rust
// UTXO Set에서 특정 주소의 잔액 합산
self.utxo_set.values()
    .filter(|output| output.recipient == address)
    .map(|output| output.amount)
    .sum()
```

JavaScript의 `.filter().map().reduce()`와 거의 같다. Rust도 함수형 스타일로 쓸 수 있다. 차이는 Rust의 이터레이터가 **lazy**(게으르다)는 것. 중간 배열을 만들지 않고 한 번에 처리한다.

---

## 현재 프로젝트 구조

```
visual-bitcoin-engine/
├── Cargo.toml
├── src/
│   ├── main.rs          ← 시나리오 실행 (진입점)
│   ├── wallet.rs        ← [NEW] 지갑 (공개키/개인키 + 디지털 서명)
│   ├── transaction.rs   ← [REWRITE] UTXO 기반 거래 (TxInput, TxOutput)
│   ├── block.rs         ← Block + 채굴
│   ├── blockchain.rs    ← [REWRITE] UTXO Set + 서명 검증 + 수수료
│   └── config.rs        ← ChainConfig (설정 파라미터화)
└── playground/
    ├── bit_ops.rs       ← 비트 연산 학습용
    └── sha256.rs        ← SHA-256 직접 구현
```

---

## 다음에 할 것

- **WASM + React 시각화** — Rust를 브라우저에서 실행해서 지갑 생성, 거래, 채굴 과정을 눈으로 보는 인터랙티브 시뮬레이터
- **가짜 P2P 네트워크** — 여러 노드가 블록을 주고받고, 체인 충돌이 발생하면 "가장 긴 체인이 이긴다" 규칙 체험

---

## 마무리

비트코인의 핵심 메커니즘이 거의 완성됐다. 블록, 해시, 체인, 채굴, 난이도 조정, UTXO 거래, 디지털 서명, 수수료.

3편에서 "쿠폰 교환"이라고 설명만 했던 UTXO를 직접 구현해보니, **왜 비트코인이 계좌 모델이 아니라 UTXO 모델을 선택했는지** 이해가 됐다. UTXO 모델은:

1. **이중지불 방지가 간단하다** — 한 번 쓴 쿠폰은 사라지니까
2. **병렬 검증이 가능하다** — 각 거래가 독립적이니까 (계좌 모델은 순서가 중요)
3. **프라이버시에 유리하다** — 매번 새 주소(거스름돈 주소)를 쓸 수 있으니까

그리고 디지털 서명을 구현하면서 느낀 것: **"코드로 신뢰를 만든다"는 게 이런 거구나.** 서버도 없고, 관리자도 없는데, 수학만으로 "이 거래를 보낸 게 진짜 나다"를 증명할 수 있다. 사토시 나카모토가 대단한 이유를 점점 더 체감하고 있다.

---

*전체 소스코드: [visual-bitcoin-engine](https://github.com/0715yk/visual-bitcoin-engine)*
