// ============================================================
// main.rs — UTXO + 디지털 서명 + 수수료 시뮬레이션
// ============================================================

mod block;
mod blockchain;
mod config;
mod transaction;
mod wallet;

use blockchain::Blockchain;
use config::ChainConfig;
use transaction::{Transaction, TxInput, TxOutput};
use wallet::Wallet;

fn main() {
    println!("╔══════════════════════════════════════════════╗");
    println!("║   UTXO + 디지털 서명 + 수수료 시뮬레이션      ║");
    println!("╚══════════════════════════════════════════════╝\n");

    // ============================================================
    // 1단계: 지갑 생성
    // ============================================================
    println!("\n  === 1단계: 지갑 생성 (공개키/개인키 쌍) ===\n");

    let miner_wallet = Wallet::new("Miner");
    let alice_wallet = Wallet::new("Alice");
    let bob_wallet = Wallet::new("Bob");
    let eve_wallet = Wallet::new("Eve (해커)");

    let mut blockchain = Blockchain::new(ChainConfig::educational());

    // ============================================================
    // 2단계: 채굴 — 코인이 세상에 나오는 유일한 방법
    // ============================================================
    println!("\n  === 2단계: Miner가 채굴 (50 BTC 코인베이스) ===\n");

    blockchain.mine_pending(&miner_wallet.public_key);

    let wallets: Vec<&Wallet> = vec![&miner_wallet, &alice_wallet, &bob_wallet, &eve_wallet];
    blockchain.print_balances(&wallets);

    // ============================================================
    // 3단계: UTXO 거래 — 쿠폰 교환 방식
    // ============================================================
    println!("\n  === 3단계: Miner → Alice: 20 BTC (수수료 0.5 BTC) ===\n");
    println!("  쿠폰 교환 과정:");
    println!("    Miner의 50 BTC 쿠폰을 파기하고");
    println!("    → Alice에게 20 BTC 쿠폰 발행");
    println!("    → Miner에게 29.5 BTC 거스름돈 쿠폰 발행");
    println!("    → 0.5 BTC는 수수료 (채굴자에게)\n");

    match blockchain.create_transaction(&miner_wallet, &alice_wallet.public_key, 20.0, 0.5) {
        Ok(tx) => {
            blockchain.add_transaction(tx);
        }
        Err(e) => println!("  [ERROR] {}", e),
    }

    blockchain.mine_pending(&miner_wallet.public_key);
    blockchain.print_balances(&wallets);

    // ============================================================
    // 4단계: Alice → Bob 거래
    // ============================================================
    println!("\n  === 4단계: Alice → Bob: 15 BTC (수수료 0.1 BTC) ===\n");

    match blockchain.create_transaction(&alice_wallet, &bob_wallet.public_key, 15.0, 0.1) {
        Ok(tx) => {
            blockchain.add_transaction(tx);
        }
        Err(e) => println!("  [ERROR] {}", e),
    }

    blockchain.mine_pending(&miner_wallet.public_key);
    blockchain.print_balances(&wallets);

    // ============================================================
    // 5단계: 위조 거래 시도! — 디지털 서명의 진가
    // ============================================================
    println!("\n  === 5단계: 위조 거래 시도 — 서명 없이는 불가능! ===\n");

    // 시도 1: Eve가 Alice의 UTXO를 훔치려고 한다
    println!("  [공격 1] Eve가 Alice인 척 거래를 만든다...");
    let alice_utxos = blockchain.find_utxos_for(&alice_wallet.public_key);

    if let Some(((tx_id, idx), _)) = alice_utxos.first() {
        let mut fake_tx = Transaction::new(
            vec![TxInput {
                tx_id: tx_id.clone(),
                output_index: *idx,
                signature: String::new(),
                public_key: eve_wallet.public_key.clone(),
            }],
            vec![TxOutput {
                amount: 4.0,
                recipient: eve_wallet.public_key.clone(),
            }],
        );
        // Eve가 자기 키로 서명한다 — 하지만 UTXO 소유자와 다르므로 실패!
        fake_tx.sign_all_inputs(&eve_wallet);
        blockchain.add_transaction(fake_tx);
    } else {
        println!("  Alice의 UTXO가 없어서 공격 시나리오 스킵");
    }

    // 시도 2: 서명 없이 거래를 보내본다
    println!("\n  [공격 2] 서명 없이 거래를 보낸다...");
    let miner_utxos = blockchain.find_utxos_for(&miner_wallet.public_key);

    if let Some(((tx_id, idx), _)) = miner_utxos.first() {
        let fake_tx = Transaction::new(
            vec![TxInput {
                tx_id: tx_id.clone(),
                output_index: *idx,
                signature: String::new(), // 서명 없음!
                public_key: miner_wallet.public_key.clone(),
            }],
            vec![TxOutput {
                amount: 10.0,
                recipient: eve_wallet.public_key.clone(),
            }],
        );
        blockchain.add_transaction(fake_tx);
    }

    // 시도 3: 잔액 부족 시도
    println!("\n  [공격 3] Alice가 가진 것보다 많이 보내려고 한다...");
    match blockchain.create_transaction(&alice_wallet, &bob_wallet.public_key, 100.0, 0.1) {
        Ok(tx) => {
            blockchain.add_transaction(tx);
        }
        Err(e) => println!("  [REJECTED] {}", e),
    }

    // ============================================================
    // 6단계: 수수료 우선순위 데모
    // ============================================================
    println!("\n  === 6단계: 수수료 우선순위 — 높은 수수료가 먼저! ===\n");
    println!("  여러 거래를 동시에 멤풀에 넣고, 수수료 순으로 처리되는지 본다\n");

    // Miner가 여러 사람에게 소액 전송 (수수료를 다르게)
    match blockchain.create_transaction(&miner_wallet, &alice_wallet.public_key, 1.0, 0.01) {
        Ok(tx) => {
            println!("  거래 A: 수수료 0.01 BTC");
            blockchain.add_transaction(tx);
        }
        Err(e) => println!("  [ERROR] {}", e),
    }

    match blockchain.create_transaction(&miner_wallet, &bob_wallet.public_key, 1.0, 0.5) {
        Ok(tx) => {
            println!("  거래 B: 수수료 0.50 BTC");
            blockchain.add_transaction(tx);
        }
        Err(e) => println!("  [ERROR] {}", e),
    }

    match blockchain.create_transaction(&miner_wallet, &alice_wallet.public_key, 1.0, 0.1) {
        Ok(tx) => {
            println!("  거래 C: 수수료 0.10 BTC");
            blockchain.add_transaction(tx);
        }
        Err(e) => println!("  [ERROR] {}", e),
    }

    println!("\n  채굴 시 수수료 높은 순서로 정렬되어 블록에 포함됨:\n");
    blockchain.mine_pending(&miner_wallet.public_key);

    // ============================================================
    // 최종 결과
    // ============================================================
    println!("\n  === 최종 결과 ===\n");
    blockchain.print_balances(&wallets);
    blockchain.print_chain();

    println!("\n[검증 시작]");
    if blockchain.validate_chain() {
        println!("  [OK] 체인이 정상입니다.");
    }
}
