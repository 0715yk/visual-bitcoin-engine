// ============================================================
// blockchain.rs — Blockchain 구조체와 검증/조작 로직을 담당하는 모듈
// ============================================================

use crate::block::Block;

pub struct Blockchain {
    pub(crate) chain: Vec<Block>,
    pub difficulty: usize,

    // [NEW] 난이도 자동 조정에 필요한 설정값들
    //
    // adjustment_interval: 몇 블록마다 난이도를 조정할지
    //   실제 비트코인: 2016블록마다
    //   우리 코드: 4블록마다 (빠르게 체험하려고)
    pub adjustment_interval: u64,

    // target_time_per_block: 블록 1개당 목표 시간 (초)
    //   실제 비트코인: 600초 (10분)
    //   우리 코드: 직접 설정 가능
    pub target_time_per_block: u64,
}

impl Blockchain {
    pub fn new(difficulty: usize, adjustment_interval: u64, target_time_per_block: u64) -> Self {
        println!("  [INIT] 난이도: {} (해시 앞자리 {}개가 0이어야 함)", difficulty, difficulty);
        println!("  [INIT] {}블록마다 난이도 자동 조정", adjustment_interval);
        println!("  [INIT] 블록당 목표 시간: {}초", target_time_per_block);
        println!("  [INIT] 제네시스 블록 채굴 중...");

        let genesis = Block::mine(0, "Genesis Block".to_string(), "0".to_string(), difficulty);

        Blockchain {
            chain: vec![genesis],
            difficulty,
            adjustment_interval,
            target_time_per_block,
        }
    }

    pub fn latest_block(&self) -> &Block {
        self.chain.last().expect("Chain must have at least one block")
    }

    // ============================================================
    // adjust_difficulty() — 난이도 자동 조정
    // ============================================================
    // 비트코인의 핵심 규칙:
    //   "N블록마다 시간을 확인해서, 목표보다 빨랐으면 난이도 올리고,
    //    느렸으면 난이도 내린다."
    //
    // 이걸로 블록 생성 속도가 항상 일정하게 유지된다.
    fn adjust_difficulty(&mut self) {
        let chain_len = self.chain.len() as u64;

        // adjustment_interval의 배수가 아니면 조정하지 않는다.
        // % = 나머지 연산 (JavaScript와 동일)
        // chain_len=4이고 interval=4이면 → 4 % 4 = 0 → 조정!
        // chain_len=5이면 → 5 % 4 = 1 → 아직 아님
        if chain_len < self.adjustment_interval || chain_len % self.adjustment_interval != 0 {
            return;
        }

        // 최근 N블록의 시작 블록과 끝 블록의 timestamp를 비교한다.
        // 예: interval=4이면, 4블록 전의 timestamp와 지금 timestamp의 차이를 본다.
        let start_index = (chain_len - self.adjustment_interval) as usize;
        let start_time = self.chain[start_index].timestamp;
        let end_time = self.latest_block().timestamp;

        // 실제 걸린 시간 (초)
        let actual_time = end_time - start_time;

        // 목표 시간 (초): 블록당 목표 시간 × 블록 수
        let expected_time = self.target_time_per_block * self.adjustment_interval;

        println!("\n  ┌─ [난이도 자동 조정] ─────────────────────┐");
        println!("  │  최근 {}블록 실제 시간: {}초", self.adjustment_interval, actual_time);
        println!("  │  목표 시간:            {}초", expected_time);

        let old_difficulty = self.difficulty;

        if actual_time < expected_time / 2 {
            // 목표의 절반보다 빨랐으면 → 난이도 올림
            self.difficulty += 1;
            println!("  │  판정: 너무 빠르다! 난이도 UP");
        } else if actual_time > expected_time * 2 {
            // 목표의 2배보다 느렸으면 → 난이도 내림 (최소 1)
            if self.difficulty > 1 {
                self.difficulty -= 1;
            }
            println!("  │  판정: 너무 느리다! 난이도 DOWN");
        } else {
            println!("  │  판정: 적절하다. 난이도 유지");
        }

        println!("  │  난이도: {} → {}", old_difficulty, self.difficulty);
        println!("  └──────────────────────────────────────────┘\n");
    }

    pub fn add_block(&mut self, data: String) {
        // 블록 추가 전에 난이도 조정이 필요한지 확인
        self.adjust_difficulty();

        let previous_hash = self.latest_block().hash.clone();
        let new_id = self.chain.len() as u64;

        println!("  [MINING] Block #{new_id} 채굴 중... (난이도: {})", self.difficulty);
        let block = Block::mine(new_id, data, previous_hash, self.difficulty);
        self.chain.push(block);
    }

    pub fn validate_chain(&self) -> bool {
        for i in 1..self.chain.len() {
            let current = &self.chain[i];
            let previous = &self.chain[i - 1];

            let recalculated = current.recalculate_hash();
            if current.hash != recalculated {
                println!("  [FAIL] Block #{} 해시 불일치!", current.id);
                println!("         → 누군가 이 블록의 데이터를 조작했다!");
                return false;
            }

            if current.previous_hash != previous.hash {
                println!("  [FAIL] Block #{} 체인 연결 끊김!", current.id);
                return false;
            }
        }

        true
    }

    pub fn tamper_block(&mut self, index: usize, new_data: String) {
        if index == 0 || index >= self.chain.len() {
            println!("  [ERROR] Block #{index}은 조작할 수 없다.");
            return;
        }

        println!("  [TAMPER] Block #{index}의 데이터를 조작한다!");
        println!("           원래: \"{}\"", self.chain[index].data);
        println!("           조작: \"{new_data}\"");

        self.chain[index].data = new_data;
    }

    pub fn print_chain(&self) {
        println!("=== Visual Bitcoin Engine (difficulty: {}) ===", self.difficulty);
        println!("Chain length: {}\n", self.chain.len());

        for block in &self.chain {
            println!("  ┌─ {block}");
            println!(
                "  │  prev_hash: {}...",
                &block.previous_hash[..16.min(block.previous_hash.len())]
            );
            println!("  │  full_hash: {}", block.hash);
            println!("  │");
        }
        println!("  └─ [end of chain]");
    }
}
