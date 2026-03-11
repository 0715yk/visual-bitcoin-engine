// ============================================================
// SHA-256 직접 구현
// 외부 라이브러리 없이, 처음부터 끝까지 만들어본다.
// ============================================================

use std::fmt::Write;

// ============================================================
// 1. 초기 해시값 (Initial Hash Values)
// ============================================================
// 처음 8개 소수(2, 3, 5, 7, 11, 13, 17, 19)의 제곱근에서
// 소수점 부분을 뽑아낸 값이다.
// 예: √2 = 1.4142... → 소수점 부분 0.4142... → 16진수로 변환 → 6a09e667
//
// 전 세계 모든 SHA-256 구현체가 이 값으로 시작한다.
// 백도어를 숨길 수 없도록 "수학에서 자동으로 나오는 값"을 사용한 것이다.
const INITIAL_HASH: [u32; 8] = [
    0x6a09e667, // √2
    0xbb67ae85, // √3
    0x3c6ef372, // √5
    0xa54ff53a, // √7
    0x510e527f, // √11
    0x9b05688c, // √13
    0x1f83d9ab, // √17
    0x5be0cd19, // √19
];

// ============================================================
// 2. 라운드 상수 (Round Constants)
// ============================================================
// 처음 64개 소수(2, 3, 5, ..., 311)의 세제곱근에서
// 소수점 부분을 뽑아낸 값이다.
// 매 라운드(1~64)마다 하나씩 사용된다.
const K: [u32; 64] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

// ============================================================
// 3. 비트 연산 도우미 함수들
// ============================================================

// 오른쪽 회전 (Right Rotate)
// 비트를 오른쪽으로 밀되, 밀려나간 비트가 왼쪽으로 돌아온다.
// 일반 시프트(>>)와 다름: 시프트는 밀려나간 비트가 사라지지만,
// 회전은 반대쪽으로 돌아온다.
//
// 예: 11010011 을 2칸 회전
//   시프트(>>): 00110100  (왼쪽에 0이 채워짐)
//   회전:      11110100  (밀려나간 11이 왼쪽으로 돌아옴)
fn right_rotate(value: u32, amount: u32) -> u32 {
    (value >> amount) | (value << (32 - amount))
}

// Ch (Choice) — e를 기준으로 f와 g 중에서 "고르기"
// e의 비트가 1인 자리 → f의 값을 선택
// e의 비트가 0인 자리 → g의 값을 선택
fn ch(e: u32, f: u32, g: u32) -> u32 {
    (e & f) ^ (!e & g)
}

// Maj (Majority) — a, b, c 중 다수결
// 3개 중 2개 이상이 1이면 1, 아니면 0
fn maj(a: u32, b: u32, c: u32) -> u32 {
    (a & b) ^ (a & c) ^ (b & c)
}

// Σ0 (Big Sigma 0) — a를 3가지 방향으로 회전시켜서 XOR
// a의 비트를 최대한 뒤섞는 역할
fn big_sigma0(a: u32) -> u32 {
    right_rotate(a, 2) ^ right_rotate(a, 13) ^ right_rotate(a, 22)
}

// Σ1 (Big Sigma 1) — e를 3가지 방향으로 회전시켜서 XOR
fn big_sigma1(e: u32) -> u32 {
    right_rotate(e, 6) ^ right_rotate(e, 11) ^ right_rotate(e, 25)
}

// σ0 (Small Sigma 0) — 메시지 스케줄에서 사용
fn small_sigma0(x: u32) -> u32 {
    right_rotate(x, 7) ^ right_rotate(x, 18) ^ (x >> 3)
}

// σ1 (Small Sigma 1) — 메시지 스케줄에서 사용
fn small_sigma1(x: u32) -> u32 {
    right_rotate(x, 17) ^ right_rotate(x, 19) ^ (x >> 10)
}

// ============================================================
// 4. 패딩 (Padding) — 입력 데이터를 512비트의 배수로 맞추기
// ============================================================
// SHA-256은 512비트(64바이트) 단위로 처리한다.
// 입력이 얼마나 길든 짧든, 512의 배수가 되도록 뒤에 데이터를 채워넣는다.
//
// 규칙:
//   1. 원본 데이터 뒤에 비트 1을 하나 붙인다 (0x80 = 10000000)
//   2. 0으로 채워서 (전체 길이 % 64 == 56)이 되게 한다
//   3. 마지막 8바이트에 원본 데이터의 비트 길이를 넣는다
fn pad_message(message: &[u8]) -> Vec<u8> {
    let original_len_bits = (message.len() as u64) * 8;
    let mut padded = message.to_vec();

    // 1. 비트 1을 하나 붙인다 (바이트로는 0x80 = 10000000)
    padded.push(0x80);

    // 2. 0으로 채워서 (길이 % 64)가 56이 되게 한다
    //    마지막 8바이트는 길이 정보를 위해 비워둬야 하므로 56
    while padded.len() % 64 != 56 {
        padded.push(0x00);
    }

    // 3. 마지막 8바이트에 원본 비트 길이를 big-endian으로 넣는다
    //    big-endian = 큰 자릿수가 앞에 오는 방식
    //    예: 40 (= 0x0000000000000028) → [0,0,0,0,0,0,0,40]
    padded.extend_from_slice(&original_len_bits.to_be_bytes());

    padded
}

// ============================================================
// 5. SHA-256 메인 함수
// ============================================================
fn sha256(message: &str) -> String {
    // 문자열을 바이트로 변환하고 패딩
    let padded = pad_message(message.as_bytes());

    // 초기 해시값을 복사해서 시작 (이 값이 라운드를 거치면서 변한다)
    let mut hash = INITIAL_HASH;

    // 패딩된 데이터를 512비트(64바이트)씩 쪼개서 처리
    // .chunks(64) = 64바이트씩 나눠서 하나씩 처리
    // JavaScript의 for(let i = 0; i < arr.length; i += 64) 와 같다
    for chunk in padded.chunks(64) {

        // ============================================================
        // 5-1. 메시지 스케줄 (Message Schedule) — 16개 → 64개로 확장
        // ============================================================
        // 입력 데이터 64바이트를 32비트(4바이트)씩 나누면 16개가 된다.
        // 이 16개를 기반으로 나머지 48개를 "생성"해서 총 64개를 만든다.
        // 이 64개가 64라운드에서 하나씩 사용된다.
        let mut w = [0u32; 64];

        // 처음 16개: 입력 데이터를 4바이트씩 묶어서 u32로 변환
        for i in 0..16 {
            w[i] = u32::from_be_bytes([
                chunk[i * 4],
                chunk[i * 4 + 1],
                chunk[i * 4 + 2],
                chunk[i * 4 + 3],
            ]);
        }

        // 나머지 48개: 이전 값들을 σ0, σ1로 섞어서 생성
        // 이전에 만든 값들을 조합해서 새로운 값을 만든다.
        for i in 16..64 {
            w[i] = small_sigma1(w[i - 2])
                .wrapping_add(w[i - 7])
                .wrapping_add(small_sigma0(w[i - 15]))
                .wrapping_add(w[i - 16]);
        }

        // ============================================================
        // 5-2. 64라운드 압축 (Compression) — 핵심!
        // ============================================================
        // a~h를 현재 해시값으로 초기화
        let mut a = hash[0];
        let mut b = hash[1];
        let mut c = hash[2];
        let mut d = hash[3];
        let mut e = hash[4];
        let mut f = hash[5];
        let mut g = hash[6];
        let mut h = hash[7];

        // 64라운드 반복!
        for i in 0..64 {
            // temp1: e를 기준으로 f,g 선택 + e 뒤섞기 + h + 상수 + 데이터 조각
            let temp1 = h
                .wrapping_add(big_sigma1(e))   // e를 3방향으로 회전시켜 XOR
                .wrapping_add(ch(e, f, g))     // e 기준으로 f,g 중 선택
                .wrapping_add(K[i])            // 이번 라운드의 상수
                .wrapping_add(w[i]);           // 이번 라운드의 데이터 조각

            // temp2: a를 뒤섞기 + a,b,c 다수결
            let temp2 = big_sigma0(a)          // a를 3방향으로 회전시켜 XOR
                .wrapping_add(maj(a, b, c));   // a,b,c 다수결

            // 한 칸씩 밀고, temp를 끼워넣는다
            h = g;
            g = f;
            f = e;
            e = d.wrapping_add(temp1);   // d + temp1 → 새 e
            d = c;
            c = b;
            b = a;
            a = temp1.wrapping_add(temp2);  // temp1 + temp2 → 새 a
        }

        // ============================================================
        // 5-3. 이번 블록의 결과를 기존 해시에 더한다
        // ============================================================
        hash[0] = hash[0].wrapping_add(a);
        hash[1] = hash[1].wrapping_add(b);
        hash[2] = hash[2].wrapping_add(c);
        hash[3] = hash[3].wrapping_add(d);
        hash[4] = hash[4].wrapping_add(e);
        hash[5] = hash[5].wrapping_add(f);
        hash[6] = hash[6].wrapping_add(g);
        hash[7] = hash[7].wrapping_add(h);
    }

    // ============================================================
    // 6. 최종 해시값을 16진수 문자열로 변환
    // ============================================================
    let mut hex_string = String::new();
    for value in hash {
        write!(hex_string, "{value:08x}").expect("Failed to write hex");
    }

    hex_string
}

// ============================================================
// 실행! — 우리가 만든 SHA-256 vs 정답 비교
// ============================================================
fn main() {
    println!("╔══════════════════════════════════════════════╗");
    println!("║   SHA-256 직접 구현 — 테스트                  ║");
    println!("╚══════════════════════════════════════════════╝\n");

    // 테스트 케이스들
    // 정답은 온라인 SHA-256 계산기에서 확인한 값이다.
    let test_cases = [
        (
            "hello",
            "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
        ),
        (
            "Hello",
            "185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969",
        ),
        (
            "bitcoin",
            "6b88c087247aa2f07ee1c5956b8e1a9f4c7f892a70e324f1bb3d161e05ca107b",
        ),
        (
            "",
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        ),
        (
            "The quick brown fox jumps over the lazy dog",
            "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
        ),
    ];

    let mut all_passed = true;

    for (input, expected) in test_cases {
        let result = sha256(input);
        let passed = result == expected;

        if !passed {
            all_passed = false;
        }

        println!("  입력: \"{}\"", input);
        println!("  결과: {}", result);
        println!("  정답: {}", expected);
        println!("  판정: {}\n", if passed { "OK" } else { "FAIL" });
    }

    if all_passed {
        println!("  모든 테스트 통과! 우리가 만든 SHA-256이 진짜와 동일하다!");
    } else {
        println!("  일부 테스트 실패. 코드를 확인해야 한다.");
    }
}
