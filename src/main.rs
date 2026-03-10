// ============================================================
// main.rs — 프로그램의 시작점
// ============================================================
// 이제 Block과 Blockchain은 각각의 파일로 분리했다.
// main.rs는 "시나리오를 실행하는 곳"으로만 쓴다.
// JavaScript로 치면 index.js(진입점)만 남기고
// 클래스들은 각각의 파일로 뺀 것과 같다.

// mod = module의 줄임말.
// "이 프로젝트에 block.rs, blockchain.rs 파일이 있다"고 Rust에게 알려준다.
// JavaScript에서 파일을 import하려면 먼저 파일이 존재해야 하듯이,
// Rust에서는 mod로 "이 파일을 모듈로 등록"해야 쓸 수 있다.
mod block;
mod blockchain;

// use = 등록한 모듈에서 특정 구조체를 꺼내 쓰겠다는 선언.
// JavaScript의 import { Blockchain } from './blockchain.js'와 같다.
use blockchain::Blockchain;

fn main() {
    // ============================================================
    // 시나리오 1: 정상적인 블록체인 생성 및 검증
    // ============================================================
    println!("╔══════════════════════════════════════════════╗");
    println!("║   시나리오 1: 정상적인 블록체인 생성         ║");
    println!("╚══════════════════════════════════════════════╝\n");

    let mut blockchain = Blockchain::new();

    blockchain.add_block("Alice -> Bob: 10 BTC".to_string());
    blockchain.add_block("Bob -> Charlie: 3 BTC".to_string());
    blockchain.add_block("Charlie -> Alice: 1 BTC".to_string());

    blockchain.print_chain();

    // 검증: 아무도 조작 안 했으니 통과해야 한다.
    println!("\n[검증 시작]");
    if blockchain.validate_chain() {
        println!("  [OK] 체인이 정상입니다. 모든 블록이 유효합니다.\n");
    }

    // ============================================================
    // 시나리오 2: 해커가 블록 데이터를 조작!
    // ============================================================
    println!("╔══════════════════════════════════════════════╗");
    println!("║   시나리오 2: 해커가 데이터를 조작한다!      ║");
    println!("╚══════════════════════════════════════════════╝\n");

    // Block #1의 거래 내역을 몰래 바꾼다.
    // "Alice가 Bob에게 10 BTC" → "Alice가 Hacker에게 100 BTC"
    blockchain.tamper_block(1, "Alice -> Hacker: 100 BTC".to_string());

    println!("\n[조작 후 체인 상태]");
    blockchain.print_chain();

    // 검증: 조작이 감지되어야 한다!
    println!("\n[검증 시작]");
    if !blockchain.validate_chain() {
        println!("\n  [BLOCKED] 조작이 감지되었습니다! 이 체인은 거부됩니다.");
        println!("  → 이것이 블록체인이 위변조에 강한 이유입니다.");
    }
}
