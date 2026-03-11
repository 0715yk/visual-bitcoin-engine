// ============================================================
// main.rs — 프로그램의 시작점
// ============================================================

mod block;
mod blockchain;
mod config;
mod transaction;

use std::time::Instant;
use blockchain::Blockchain;
use config::ChainConfig;
use transaction::Transaction;

fn main() {
    // ============================================================
    // 시나리오: 거래(Transaction) 구조화 체험
    // ============================================================
    // 이전: "Alice -> Bob: 10 BTC" 라는 문자열
    // 지금: Transaction { from: "Alice", to: "Bob", amount: 10.0 }
    //
    // 실제 비트코인처럼:
    //   1. 사용자가 거래를 보냄 → 멤풀(대기열)에 쌓임
    //   2. 채굴자가 멤풀에서 거래를 골라서 블록에 포함
    //   3. 블록 맨 앞에 코인베이스 거래(채굴 보상)가 자동 추가
    // ============================================================
    println!("╔══════════════════════════════════════════════╗");
    println!("║   거래(Transaction) 구조화 시뮬레이션          ║");
    println!("╚══════════════════════════════════════════════╝\n");

    let start = Instant::now();

    let mut blockchain = Blockchain::new(ChainConfig::educational());

    // --- 거래들을 멤풀에 추가한다 ---
    println!("\n  === 거래를 멤풀에 추가 ===\n");

    blockchain.add_transaction(Transaction::new("Alice", "Bob", 10.0));
    blockchain.add_transaction(Transaction::new("Bob", "Charlie", 3.0));
    blockchain.add_transaction(Transaction::new("Charlie", "Alice", 1.5));

    // --- 채굴자 "Miner1"이 블록을 채굴한다 ---
    // 멤풀에 있는 거래 3건 + 코인베이스(채굴 보상) 1건 = 총 4건
    println!("\n  === Miner1이 채굴 시작 ===\n");
    blockchain.mine_pending("Miner1");

    // --- 추가 거래를 보내고 다시 채굴 ---
    println!("\n  === 추가 거래 + Miner2가 채굴 ===\n");

    blockchain.add_transaction(Transaction::new("Alice", "Dave", 2.0));
    blockchain.add_transaction(Transaction::new("Dave", "Eve", 5.0));
    blockchain.add_transaction(Transaction::new("Bob", "Frank", 1.0));
    blockchain.add_transaction(Transaction::new("Eve", "Alice", 0.5));

    // 이번엔 "Miner2"가 채굴 — 채굴 보상은 Miner2에게!
    blockchain.mine_pending("Miner2");

    // --- 한 번 더 ---
    println!("\n  === 추가 거래 + Miner1이 다시 채굴 ===\n");

    blockchain.add_transaction(Transaction::new("Frank", "Grace", 7.0));
    blockchain.add_transaction(Transaction::new("Grace", "Bob", 3.5));

    blockchain.mine_pending("Miner1");

    let duration = start.elapsed();

    // --- 결과 출력 ---
    println!("\n  총 소요 시간: {:.2?}", duration);
    println!("  현재 채굴 보상: {} BTC\n", blockchain.current_block_reward());

    blockchain.print_chain();

    println!("\n[검증 시작]");
    if blockchain.validate_chain() {
        println!("  [OK] 체인이 정상입니다.");
    }
}
