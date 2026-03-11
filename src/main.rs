// ============================================================
// main.rs — 프로그램의 시작점
// ============================================================

mod block;
mod blockchain;
mod config;
mod transaction;

use blockchain::Blockchain;
use config::ChainConfig;
use transaction::Transaction;

fn main() {
    // ============================================================
    // 시나리오: 잔액 검증 체험
    // ============================================================
    println!("╔══════════════════════════════════════════════╗");
    println!("║   잔액 검증 시뮬레이션                        ║");
    println!("╚══════════════════════════════════════════════╝\n");

    let mut blockchain = Blockchain::new(ChainConfig::educational());

    // --- 1단계: Miner1이 채굴해서 50 BTC를 받는다 ---
    println!("\n  === 1단계: Miner1이 빈 블록을 채굴 (50 BTC 보상) ===\n");
    blockchain.mine_pending("Miner1");

    blockchain.print_balances();

    // --- 2단계: Miner1이 Alice에게 20 BTC를 보낸다 ---
    println!("\n  === 2단계: Miner1 → Alice: 20 BTC ===\n");
    blockchain.add_transaction(Transaction::new("Miner1", "Alice", 20.0));
    blockchain.mine_pending("Miner1");

    blockchain.print_balances();

    // --- 3단계: Alice가 Bob에게 15 BTC, Charlie에게 3 BTC를 보낸다 ---
    println!("\n  === 3단계: Alice가 여러 거래를 보낸다 ===\n");
    blockchain.add_transaction(Transaction::new("Alice", "Bob", 15.0));
    blockchain.add_transaction(Transaction::new("Alice", "Charlie", 3.0));
    blockchain.mine_pending("Miner1");

    blockchain.print_balances();

    // --- 4단계: 잔액 부족 거래 시도! ---
    println!("\n  === 4단계: 잔액 부족 거래 시도 ===\n");

    // Alice는 현재 2 BTC밖에 없다.
    // 100 BTC를 보내려고 하면?
    println!("  Alice가 100 BTC를 보내려고 시도...");
    blockchain.add_transaction(Transaction::new("Alice", "Hacker", 100.0));

    // Bob은 15 BTC가 있다.
    // 20 BTC를 보내려고 하면?
    println!("\n  Bob이 20 BTC를 보내려고 시도...");
    blockchain.add_transaction(Transaction::new("Bob", "Dave", 20.0));

    // Bob이 정상 금액(5 BTC)을 보내면?
    println!("\n  Bob이 5 BTC를 보내려고 시도...");
    blockchain.add_transaction(Transaction::new("Bob", "Dave", 5.0));

    blockchain.mine_pending("Miner1");

    // --- 최종 잔액 확인 ---
    println!("\n  === 최종 결과 ===\n");
    blockchain.print_balances();
    blockchain.print_chain();

    println!("\n[검증 시작]");
    if blockchain.validate_chain() {
        println!("  [OK] 체인이 정상입니다.");
    }
}
