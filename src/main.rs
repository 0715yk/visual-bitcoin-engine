// ============================================================
// main.rs — 프로그램의 시작점
// ============================================================

mod block;
mod blockchain;
mod config;

use std::time::Instant;
use blockchain::Blockchain;
use config::ChainConfig;

fn main() {
    // ============================================================
    // 시나리오 1: 교육용 프리셋으로 시뮬레이션
    // ============================================================
    println!("╔══════════════════════════════════════════════╗");
    println!("║   시나리오 1: 교육용 프리셋                    ║");
    println!("╚══════════════════════════════════════════════╝\n");

    let start = Instant::now();

    // ChainConfig::educational()로 교육용 설정 사용
    // 난이도 2, 4블록마다 조정, 블록당 3초, 10블록마다 반감기
    let mut blockchain = Blockchain::new(ChainConfig::educational());

    let transactions = [
        "Alice -> Bob: 10 BTC",
        "Bob -> Charlie: 3 BTC",
        "Charlie -> Alice: 1 BTC",
        "Dave -> Eve: 5 BTC",
        "Eve -> Frank: 2 BTC",
        "Frank -> Grace: 7 BTC",
        "Grace -> Heidi: 4 BTC",
        "Heidi -> Ivan: 6 BTC",
        "Ivan -> Judy: 8 BTC",
        "Judy -> Alice: 1 BTC",
        "Alice -> Dave: 3 BTC",
        "Dave -> Bob: 2 BTC",
    ];

    for tx in transactions {
        blockchain.add_block(tx.to_string());
    }

    let duration = start.elapsed();

    println!("\n  총 소요 시간: {:.2?}", duration);
    println!("  최종 난이도: {}", blockchain.difficulty);
    println!("  현재 채굴 보상: {} BTC\n", blockchain.current_block_reward());

    blockchain.print_chain();

    println!("\n[검증 시작]");
    if blockchain.validate_chain() {
        println!("  [OK] 체인이 정상입니다.\n");
    }

    // ============================================================
    // 시나리오 2: 비트코인 실제 설정값 확인
    // ============================================================
    println!("╔══════════════════════════════════════════════╗");
    println!("║   시나리오 2: 비트코인 실제 설정값              ║");
    println!("╚══════════════════════════════════════════════╝\n");

    // 실제 비트코인 파라미터를 출력만 한다 (실행하면 너무 오래 걸리니까)
    let btc_config = ChainConfig::bitcoin();
    btc_config.print_config();
    println!("\n  → 이 설정으로 실행하면 실제 비트코인과 동일한 규칙으로 동작한다.");
    println!("  → 단, 난이도가 빠르게 올라가므로 시뮬레이션은 교육용 프리셋을 추천.\n");

    // ============================================================
    // 시나리오 3: 커스텀 설정으로 실험
    // ============================================================
    println!("╔══════════════════════════════════════════════╗");
    println!("║   시나리오 3: 커스텀 설정 실험                  ║");
    println!("╚══════════════════════════════════════════════╝\n");

    // 직접 원하는 값을 넣어서 실험!
    // 반감기를 5블록으로 줄여서, 보상이 빠르게 줄어드는 것을 체험
    let custom_config = ChainConfig::custom(
        2,      // 초기 난이도
        4,      // 4블록마다 난이도 조정
        3,      // 블록당 목표 3초
        100.0,  // 초기 보상 100 BTC
        5,      // 5블록마다 반감기! (빠르게 체험)
        10,     // 블록당 최대 거래 10건
    );

    let mut custom_chain = Blockchain::new(custom_config);

    for i in 1..=12 {
        custom_chain.add_block(format!("Transaction #{i}"));
    }

    println!("\n  최종 채굴 보상: {} BTC", custom_chain.current_block_reward());
    println!("  → 반감기가 5블록마다 → 보상이 빠르게 줄어든다!");
}
