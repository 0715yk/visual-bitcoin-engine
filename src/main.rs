// ============================================================
// main.rs — 프로그램의 시작점
// ============================================================

mod block;
mod blockchain;

use std::time::Instant;
use blockchain::Blockchain;

fn main() {
    // ============================================================
    // 시나리오: 난이도 자동 조정 체험
    // ============================================================
    // 4블록마다 난이도를 자동 조정한다.
    // 블록당 목표 시간을 3초로 설정한다.
    // → 4블록이 12초 안에 끝나면 "너무 빠르다" → 난이도 올림
    // → 4블록이 24초 이상 걸리면 "너무 느리다" → 난이도 내림
    //
    // 실제 비트코인:
    //   2016블록마다 조정, 블록당 목표 600초 (10분)
    // ============================================================
    println!("╔══════════════════════════════════════════════╗");
    println!("║   난이도 자동 조정 시뮬레이션                  ║");
    println!("╚══════════════════════════════════════════════╝\n");

    let start = Instant::now();

    // 난이도 2로 시작, 4블록마다 조정, 블록당 목표 3초
    let mut blockchain = Blockchain::new(2, 4, 3);

    // 12개 블록을 채굴한다.
    // 4블록마다 난이도가 자동 조정되는 것을 관찰!
    let transactions = [
        "Alice -> Bob: 10 BTC",
        "Bob -> Charlie: 3 BTC",
        "Charlie -> Alice: 1 BTC",
        "Dave -> Eve: 5 BTC",       // 여기서 4블록째 → 난이도 조정!
        "Eve -> Frank: 2 BTC",
        "Frank -> Grace: 7 BTC",
        "Grace -> Heidi: 4 BTC",
        "Heidi -> Ivan: 6 BTC",     // 여기서 8블록째 → 난이도 조정!
        "Ivan -> Judy: 8 BTC",
        "Judy -> Alice: 1 BTC",
        "Alice -> Dave: 3 BTC",
        "Dave -> Bob: 2 BTC",       // 여기서 12블록째 → 난이도 조정!
    ];

    for tx in transactions {
        blockchain.add_block(tx.to_string());
    }

    let duration = start.elapsed();

    println!("\n  총 소요 시간: {:.2?}", duration);
    println!("  최종 난이도: {}\n", blockchain.difficulty);

    blockchain.print_chain();

    println!("\n[검증 시작]");
    if blockchain.validate_chain() {
        println!("  [OK] 체인이 정상입니다. 모든 블록이 유효합니다.");
    }
}
