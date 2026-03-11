# 프론트엔드 개발자가 Rust로 비트코인 거래 시스템을 만들어봤다

> 비트코인 시각화 프로젝트 3편 — 거래 구조화, 잔액 검증, 그리고 블록체인의 철학

## 이전 글 요약

[2편](https://velog.io/@0715yk)에서는 SHA-256을 직접 구현하고, 채굴(Proof of Work)과 난이도 자동 조정까지 만들었다. 이번 편에서는:

1. **거래(Transaction) 구조화** — 단순 문자열에서 구조체로
2. **잔액 검증** — 없는 돈을 보내는 걸 막는 로직
3. **잔액 캐시** — 성능 최적화
4. **ChainConfig 리팩토링** — 모든 설정값을 파라미터화

그리고 비트코인의 철학에 대해서도 깊이 생각해봤다.

---

## ChainConfig — 모든 설정값을 한 곳에

이전까지는 난이도, 조정 주기, 목표 시간을 따로따로 넘겼다. 나중에 프론트엔드에서 슬라이더로 값을 바꿔가며 시뮬레이션하려면, 설정값을 구조체 하나로 통합해야 했다.

```rust
pub struct ChainConfig {
    pub initial_difficulty: usize,         // 초기 난이도
    pub adjustment_interval: u64,          // 난이도 조정 주기
    pub target_time_per_block: u64,        // 블록당 목표 시간 (초)
    pub initial_block_reward: f64,         // 초기 채굴 보상 (BTC)
    pub halving_interval: u64,             // 반감기 주기
    pub max_transactions_per_block: usize, // 블록당 최대 거래 수
}
```

프리셋 3종:

```rust
ChainConfig::bitcoin()       // 실제 비트코인 값 (2016블록, 600초, 50 BTC...)
ChainConfig::educational()   // 교육용 축소판 (4블록, 3초, 50 BTC...)
ChainConfig::custom(...)     // 직접 설정
```

이제 `Blockchain::new(ChainConfig::educational())` 한 줄이면 블록체인이 생성된다. 나중에 React에서 슬라이더를 만들면 이 Config 값을 바꿔서 WASM에 넘기면 된다.

---

## 거래(Transaction) 구조화

### 이전 vs 지금

```rust
// 이전: 단순 문자열
data: "Alice -> Bob: 10 BTC"

// 지금: 구조체
Transaction {
    from: "Alice",
    to: "Bob",
    amount: 10.0,
}
```

### 코인베이스 거래 — 비트코인이 세상에 나오는 유일한 방법

블록의 첫 번째 거래는 항상 **코인베이스 거래**다. 이전 소유자 없이 새로운 코인이 생성되는 특별한 거래.

```rust
pub fn coinbase(to: &str, reward: f64) -> Self {
    Transaction {
        from: "COINBASE".to_string(),
        to: to.to_string(),
        amount: reward,
    }
}
```

실행 결과:

```
Block #1:
  📄 [COINBASE] → Miner1: 50 BTC    ← 채굴 보상 (자동 추가)
  📄 Alice → Bob: 10 BTC             ← 일반 거래
  📄 Bob → Charlie: 3 BTC
```

참고로 "코인베이스(Coinbase)"라는 거래소 회사는 이 용어에서 이름을 따온 것이다. "코인이 태어나는 곳(base)"이라는 뜻.

### 멤풀 (Mempool) — 대기열

실제 비트코인에서 거래를 보내면 바로 블록에 들어가지 않는다. **멤풀(대기열)**에 쌓였다가, 채굴자가 골라서 블록에 포함시킨다.

```rust
blockchain.add_transaction(Transaction::new("Alice", "Bob", 10.0));
// → 멤풀에 대기

blockchain.mine_pending("Miner1");
// → 멤풀에서 꺼내서 블록에 포함 + 채굴
```

바이낸스에서 출금할 때 "네트워크 확인 중..." 하고 기다리는 그 시간이, 채굴자가 내 거래를 블록에 넣고 채굴하는 과정이었다.

---

## 잔액 검증 — 없는 돈은 보낼 수 없다

### 핵심 로직

```rust
pub fn add_transaction(&mut self, transaction: Transaction) -> bool {
    let sender_balance = self.get_balance(&transaction.from);

    if sender_balance < transaction.amount {
        // 잔액 부족! 거래 거부
        return false;
    }

    self.pending_transactions.push(transaction);
    true
}
```

### 실행 결과

```
Alice 잔액: 2.00 BTC
  Alice가 100 BTC 보내려고 시도 → [REJECTED] 잔액 부족!

Bob 잔액: 15.00 BTC
  Bob이 20 BTC 보내려고 시도 → [REJECTED] 잔액 부족!
  Bob이 5 BTC 보내려고 시도 → [TX] 거래 승인!
```

### 잔액은 어디에 저장되나?

블록체인에 "잔액"이라는 필드는 **없다**. 전체 거래 내역에서 "받은 금액 - 보낸 금액"을 계산하는 것이다. 처음에는 매번 전체 블록을 순회했는데, `HashMap` 캐시를 추가해서 즉시 조회하도록 최적화했다.

```rust
// 이전: O(n) — 블록 수에 비례
for block in &self.chain {
    for tx in &block.transactions { ... }
}

// 지금: O(1) — 즉시
*self.balances.get(address).unwrap_or(&0.0)
```

실제 비트코인은 **UTXO Set**이라는 캐시를 별도로 관리한다. "아직 안 쓴 거래 출력(Unspent Transaction Output)" 목록을 따로 저장해두고, 잔액을 확인할 때 이것만 본다.

---

## 실제 비트코인 거래는 "쿠폰 교환"

우리 코드는 "잔액에서 차감"하는 계좌 모델이지만, 실제 비트코인은 UTXO 모델이라 **쿠폰 교환**에 가깝다.

```
Alice의 UTXO: [12 BTC 쿠폰]

Alice가 Bob에게 10 BTC를 보내고 싶다:
  ✗ 12 BTC에서 10을 차감? → 이렇게 안 함!
  ✓ 12 BTC 쿠폰을 "사용"(파기)하고
    → 새 쿠폰 2장 발행:
      Bob에게: 10 BTC 쿠폰
      Alice에게: 2 BTC 쿠폰 (거스름돈)
```

현금으로 물건 사는 것과 같다. 만원짜리로 7000원짜리를 사면, 만원을 내고 3000원 거스름돈을 받는 것이다. 거스름돈을 안 지정하면 그 차이가 **수수료로 채굴자에게 간다**. 실수로 거스름돈을 안 적으면 큰 손해를 볼 수 있다!

---

## 비트코인에는 서버가 없다

비트코인 프로토콜 코드에 난이도 조정 규칙이 박혀있다. 관리자도, 투표도 없이 코드가 알아서 조정한다. 사토시 나카모토가 2009년에 넣어놓고 사라졌는데, 17년째 돌아가고 있다.

그런데 "서버가 없으면 어떻게 돌아가나?"

```
일반 서비스:  유저 → 서버 → 유저  (서버 끄면 끝)
비트코인:     유저 ↔ 유저 ↔ 유저   (P2P, 서버 없음)
```

전 세계 약 15,000~50,000대의 컴퓨터가 비트코인 프로그램을 돌리고 있다. 토렌트처럼 사용자끼리 직접 통신하는 구조. 비트코인을 멈추려면 전 세계 모든 노드를 동시에 꺼야 하는데, 사실상 불가능하다.

---

## 거래소는 블록체인이 아니다

바이낸스에서 비트코인을 사고팔 때, 실제로 블록체인 위에서 거래가 일어나는 게 **아니다**. 바이낸스 내부 DB에서 숫자만 바뀌는 것이다.

진짜 블록체인 거래는 **바이낸스에서 내 하드월렛으로 출금할 때** 일어난다. 그래서 "Not your keys, not your coins"라는 말이 있다. 거래소에 맡긴 코인은 거래소가 해킹당하면 사라진다 (FTX 사태).

---

## PoW vs PoS — 공정한 시스템은 존재하는가?

이더리움이 2022년에 Proof of Stake(PoS)로 전환했다는 걸 알게 되었다.

```
PoW: 계산량(노동)으로 보상 → 전기세 많이 듦
PoS: 보유량(자본)으로 보상 → 전기 거의 안 듦
```

PoS가 효율적이긴 한데, 구조적 문제가 있다:

```
PoS: 부자 → 스테이킹 많이 → 보상 많이 → 더 부자 (빈부격차 고착)
PoW: 부자여도 전기세/장비 유지비 지출 → 경쟁이 계속 바뀜
```

하지만 PoW도 결국 자본 싸움이 된 건 사실이다. 좋은 채굴기를 살 돈이 있는 쪽이 유리하니까. 100% 공정한 시스템은 현실적으로 존재하기 어렵다.

---

## "Code is Law" — 코드는 거짓말을 하지 않는다

블록체인의 핵심 철학을 한 마디로 정리하면:

```
기존 세상:  "나를 믿어라" (Trust me)
블록체인:   "코드를 확인해라" (Verify, don't trust)
```

우리가 만든 `validate_chain()`은 감정 없이 조작을 감지하고, `mine()`은 예외 없이 난이도를 강제하고, `current_block_reward()`는 협상 없이 반감기를 적용한다. 사람한테 맡기면 "이번만 예외로..."가 생기지만, 코드는 그런 게 없다.

체계를 부수고 만든 새로운 체계도 결국 완벽하진 않았지만, **"코드로 신뢰를 만들 수 있다"**는 가능성을 증명한 것 자체가 역사적 의미가 있다. 그리고 AI 시대에는 "누구도 믿을 수 없는 세상"이 될 텐데, "신뢰 없이 작동하는 시스템"이 더 필요해질 수 있다.

---

## 현재 프로젝트 구조

```
visual-bitcoin-engine/
├── Cargo.toml
├── src/
│   ├── main.rs          ← 시나리오 실행 (진입점)
│   ├── block.rs         ← Block + 채굴
│   ├── blockchain.rs    ← Blockchain + 검증 + 잔액 캐시
│   ├── transaction.rs   ← Transaction (거래 구조체)
│   └── config.rs        ← ChainConfig (설정 파라미터화)
└── playground/
    ├── bit_ops.rs       ← 비트 연산 학습용
    └── sha256.rs        ← SHA-256 직접 구현
```

---

## 다음에 할 것

- **지갑 + 디지털 서명** — 공개키/개인키로 "이 거래를 보낸 게 진짜 나다" 증명. 양자컴퓨터가 위협하는 바로 그 부분!
- **수수료** — 채굴자가 수수료 높은 거래를 먼저 처리하는 구조
- **WASM + React 시각화** — Rust를 브라우저에서 실행, 가짜 P2P 시뮬레이션

---

## 마무리

비트코인의 핵심 구조가 거의 다 갖춰졌다. 블록, 해시, 체인 연결, 채굴, 난이도 조정, 거래, 잔액 검증. 남은 건 디지털 서명(본인 인증)과 시각화다.

직접 만들어보니 비트코인이 "화폐"로서보다, **"신뢰를 코드로 구현한 실험"**으로서 더 인상적이었다. 완벽하진 않지만, "코드로 만든 새로운 세계"를 열어준 건 확실하다.

---

*전체 소스코드: [visual-bitcoin-engine](https://github.com/0715yk/visual-bitcoin-engine)*
