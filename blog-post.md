# 프론트엔드 개발자가 Rust로 비트코인 원리를 직접 구현해봤다

> Rust도 배우고, 블록체인도 이해하고 — 두 마리 토끼를 잡아보자.

## 왜 이걸 시작했나?

프론트엔드 개발자로 일하면서 항상 궁금했다. **비트코인은 대체 어떻게 동작하는 걸까?**

"블록체인", "해시", "채굴" 같은 단어는 수없이 들었지만, 직접 코드로 만들어본 적은 없었다. 그러다 문득 생각했다.

> "그냥 직접 만들어보면 되지 않나?"

언어는 **Rust**를 선택했다. 시스템 프로그래밍 언어를 한번 경험해보고 싶기도 했고, 비트코인 자체가 저수준(low-level)에 가까운 기술이라 잘 어울릴 것 같았다.

---

## 프로젝트 세팅

```bash
# Rust 설치 (Windows)
winget install Rustlang.Rustup
rustup default stable-x86_64-pc-windows-gnu

# 프로젝트 초기화
cargo init visual-bitcoin-engine
```

Rust의 빌드 도구인 **Cargo**로 프로젝트를 만들면 이런 구조가 생긴다.

```
visual-bitcoin-engine/
├── Cargo.toml    ← 프로젝트 설정 + 의존성 관리 (npm의 package.json)
└── src/
    └── main.rs   ← 코드 진입점
```

---

## Step 1: 블록의 뼈대 만들기

블록체인은 이름 그대로 **블록(Block)**이 **체인(Chain)**으로 연결된 것이다. 먼저 블록 하나가 어떻게 생겼는지 정의했다.

```rust
struct Block {
    id: u64,              // 블록 번호
    timestamp: u64,       // 생성 시각 (Unix timestamp)
    data: String,         // 거래 데이터
    previous_hash: String, // 이전 블록의 해시 ← 체인 연결의 핵심!
    hash: String,         // 이 블록의 해시
}
```

그리고 이 블록들을 담는 `Blockchain` 구조체:

```rust
struct Blockchain {
    chain: Vec<Block>,  // Vec = JavaScript의 Array
}
```

### Rust 첫인상 — JavaScript와의 차이

Rust를 처음 접하면서 느낀 차이점들:

| JavaScript | Rust | 비고 |
|---|---|---|
| `import { X } from 'y'` | `use y::X` | `::`가 경로 구분자 |
| `let` / `const` | `let mut` / `let` | Rust는 기본이 불변 |
| `console.log()` | `println!()` | `!`가 붙으면 매크로 |
| `class` | `struct` + `impl` | 구조체에 메서드를 따로 붙이는 방식 |

특히 `println!`의 `!`가 인상적이었다. Rust에서 `!`가 붙으면 **함수가 아니라 매크로**다. 매크로는 컴파일 시점에 코드를 생성하는 도구인데, `println!`처럼 인자 개수가 유동적인 경우에 사용된다.

---

## Step 2: SHA-256 진짜 해시 붙이기

처음에는 `"hash_of_block_0"` 같은 가짜 해시를 썼다. 이걸 진짜 **SHA-256 해시**로 교체했다.

```toml
# Cargo.toml
[dependencies]
sha2 = "0.10"
```

```rust
use sha2::{Digest, Sha256};

fn calculate_hash(id: u64, timestamp: u64, data: &str, previous_hash: &str) -> String {
    let input = format!("{id}{timestamp}{data}{previous_hash}");
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    // ... 바이트를 16진수 문자열로 변환
}
```

### SHA-256이 뭔데?

어떤 데이터를 넣든 **항상 64자리 16진수 문자열**을 뱉어내는 함수다.

```
"hello"  → "2cf24dba5fb0a30e..."
"hello!" → "ce06092fb948d9ff..."  ← 1글자 추가했을 뿐인데 완전히 다름
"hello"  → "2cf24dba5fb0a30e..."  ← 다시 넣으면 항상 같은 결과
```

핵심은 **단방향**이라는 것. 해시에서 원본 데이터를 역추적하는 건 불가능하다. 내부적으로 비트를 64라운드 반복해서 XOR, 비트 시프트, 덧셈 등으로 섞어버리기 때문이다. 스크램블 에그를 다시 계란으로 되돌릴 수 없는 것과 같다.

이걸 **미국 NSA가 2001년에 만들었다**는 것도 재밌는 사실. 감시 기관이 만든 암호 기술이 탈중앙화의 핵심이 되다니.

### 실행 결과 — 블록들이 진짜 해시로 연결되다

```
=== Visual Bitcoin Engine ===
Chain length: 4

  ┌─ Block #0 [hash: 1396b9826c055eb9... | data: "Genesis Block"]
  │  prev_hash: 0...
  │
  ┌─ Block #1 [hash: 0738ff35c9f368f5... | data: "Alice -> Bob: 10 BTC"]
  │  prev_hash: 1396b9826c055eb9...   ← Block #0의 해시!
  │
  ┌─ Block #2 [hash: 2e393dc810380f5b... | data: "Bob -> Charlie: 3 BTC"]
  │  prev_hash: 0738ff35c9f368f5...   ← Block #1의 해시!
```

각 블록의 `prev_hash`가 바로 이전 블록의 `hash`와 정확히 일치한다. 이게 **체인**이다.

---

## Step 3: 위변조 감지 시스템

여기서 핵심 질문: **누군가 블록의 데이터를 바꾸면 어떻게 될까?**

### 검증 로직

```rust
fn validate_chain(&self) -> bool {
    for i in 1..self.chain.len() {
        let current = &self.chain[i];
        let previous = &self.chain[i - 1];

        // 1. 블록 내용을 다시 해시 → 저장된 해시와 비교
        if current.hash != current.recalculate_hash() {
            return false; // 조작됨!
        }

        // 2. previous_hash가 이전 블록의 hash와 일치하는지
        if current.previous_hash != previous.hash {
            return false; // 체인 끊김!
        }
    }
    true
}
```

### 조작 시뮬레이션

Block #1의 데이터를 몰래 바꿔봤다:

```
원래: "Alice -> Bob: 10 BTC"
조작: "Alice -> Hacker: 100 BTC"
```

결과:

```
[FAIL] Block #1 해시 불일치!
       저장된 해시: 0738ff35c9f368f5...
       다시 계산:   24a46166fa9fa140...  ← 데이터가 바뀌니 해시도 완전히 다름!
       → 누군가 이 블록의 데이터를 조작했다!

[BLOCKED] 조작이 감지되었습니다! 이 체인은 거부됩니다.
```

data만 바꿨는데 해시를 다시 계산하면 결과가 달라지니까, **저장된 해시와 맞지 않아서 즉시 감지**된다.

---

## 파일 분리 — 프로젝트가 커지니까

코드가 길어져서 모듈별로 분리했다.

```
src/
├── main.rs        ← 실행 시나리오만 (깔끔한 진입점)
├── block.rs       ← Block 구조체 + SHA-256 해시 계산
└── blockchain.rs  ← Blockchain + 검증 + 조작 시뮬레이션
```

Rust에서 파일을 분리할 때는 `mod`로 모듈을 등록하고, `pub`으로 외부 공개 범위를 정한다.

```rust
// main.rs
mod block;        // block.rs를 모듈로 등록
mod blockchain;   // blockchain.rs를 모듈로 등록

use blockchain::Blockchain;  // 꺼내 쓰기
```

JavaScript의 `import/export`와 비슷하지만, Rust는 기본이 **private**이고 `pub`을 명시적으로 붙여야 외부에서 접근할 수 있다.

---

## 오늘 배운 것들

### 블록체인의 3중 방어 구조

| 방어 수단 | 막는 것 |
|-----------|---------|
| **해시 검증** | 데이터만 살짝 바꾸는 공격 |
| **분산 저장 + 다수결** | 블록을 다시 만들어서 바꿔치기하는 공격 |
| **Proof of Work (채굴)** | 전체 네트워크의 51%를 장악하려는 공격 |

### SHA-256 vs 양자컴퓨터

양자컴퓨터가 비트코인을 위협한다고 하지만, 실제로 위험한 건 SHA-256이 아니라 **디지털 서명(ECDSA)**이다.

- **SHA-256**: 역추적 공식 자체가 없음 → 양자컴퓨터가 빨라도 소용없음
- **ECDSA**: 수학 공식이 존재 → 양자컴퓨터가 이 공식을 빠르게 역으로 풀 수 있음

다만 현재 양자컴퓨터는 아직 비트코인을 뚫기에 1000배 이상 부족하고, 대응책(양자 내성 암호)도 이미 연구 중이다.

---

## 다음에 할 것

- **채굴 (Proof of Work)** — 블록 하나 만드는 데 비용(계산 시간)을 붙여서, 조작을 경제적으로 불가능하게 만든다
- **거래(Transaction) 구조화** — 단순 문자열 대신 보내는 사람/받는 사람/금액을 구조체로
- **잔액 검증** — "없는 돈을 보내는 것"을 막는 로직
- **지갑 + 디지털 서명** — 공개키/개인키로 본인 인증

---

## 마무리

프론트엔드 개발자에게 Rust와 블록체인은 꽤 먼 세계처럼 느껴졌는데, 직접 만들어보니 생각보다 구조가 단순하고 아름다웠다.

결국 블록체인은 **"해시로 연결된 배열"**이고, 비트코인의 보안은 **"수학적으로 역추적이 불가능한 단방향 함수"** 위에 서 있다.

코드는 [GitHub](https://github.com/0715yk/visual-bitcoin-engine) 에 올려두었다. 다음 포스트에서는 채굴을 직접 구현하면서, "왜 채굴에 GPU가 필요한지"를 체감해볼 계획이다.

---

*전체 소스코드: [visual-bitcoin-engine](https://github.com/0715yk/visual-bitcoin-engine)*
