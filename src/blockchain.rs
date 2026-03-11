// ============================================================
// blockchain.rs — Blockchain 구조체와 검증/조작 로직을 담당하는 모듈
// ============================================================

use crate::block::Block;
use crate::config::ChainConfig;

pub struct Blockchain {
    pub(crate) chain: Vec<Block>,

    // 현재 난이도 (자동 조정으로 변한다)
    pub difficulty: usize,

    // 설정값 — ChainConfig에서 가져온다.
    // 이제 모든 파라미터가 config 안에 들어있다.
    pub config: ChainConfig,
}

impl Blockchain {
    // ChainConfig를 받아서 블록체인을 생성한다.
    // 이전에는 (difficulty, adjustment_interval, target_time_per_block)을
    // 따로따로 받았지만, 이제는 config 하나로 통합.
    pub fn new(config: ChainConfig) -> Self {
        config.print_config();
        println!("\n  [INIT] 제네시스 블록 채굴 중...");

        let genesis = Block::mine(
            0,
            "Genesis Block".to_string(),
            "0".to_string(),
            config.initial_difficulty,
        );

        Blockchain {
            chain: vec![genesis],
            difficulty: config.initial_difficulty,
            config,
        }
    }

    pub fn latest_block(&self) -> &Block {
        self.chain.last().expect("Chain must have at least one block")
    }

    // 난이도 자동 조정 — config에서 설정값을 가져온다
    fn adjust_difficulty(&mut self) {
        let chain_len = self.chain.len() as u64;

        if chain_len < self.config.adjustment_interval
            || chain_len % self.config.adjustment_interval != 0
        {
            return;
        }

        let start_index = (chain_len - self.config.adjustment_interval) as usize;
        let start_time = self.chain[start_index].timestamp;
        let end_time = self.latest_block().timestamp;

        let actual_time = end_time - start_time;
        let expected_time = self.config.target_time_per_block * self.config.adjustment_interval;

        println!("\n  ┌─ [난이도 자동 조정] ─────────────────────┐");
        println!(
            "  │  최근 {}블록 실제 시간: {}초",
            self.config.adjustment_interval, actual_time
        );
        println!("  │  목표 시간:            {}초", expected_time);

        let old_difficulty = self.difficulty;

        if actual_time < expected_time / 2 {
            self.difficulty += 1;
            println!("  │  판정: 너무 빠르다! 난이도 UP");
        } else if actual_time > expected_time * 2 {
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

    // 현재 블록 높이에 따른 채굴 보상을 계산한다.
    // 반감기(halving_interval)마다 보상이 절반으로 줄어든다.
    // 비트코인: 50 → 25 → 12.5 → 6.25 → 3.125 BTC
    pub fn current_block_reward(&self) -> f64 {
        let block_height = self.chain.len() as u64;
        // 몇 번 반감했는지 계산
        // 예: 블록 420,001이고 halving_interval=210,000이면
        //     420001 / 210000 = 2 → 2번 반감 → 50 / 4 = 12.5 BTC
        let halvings = block_height / self.config.halving_interval;

        // 2의 halvings제곱으로 나눈다
        // halvings=0 → 50 / 1 = 50
        // halvings=1 → 50 / 2 = 25
        // halvings=2 → 50 / 4 = 12.5
        // halvings=3 → 50 / 8 = 6.25
        self.config.initial_block_reward / (2_u64.pow(halvings as u32) as f64)
    }

    pub fn add_block(&mut self, data: String) {
        self.adjust_difficulty();

        let reward = self.current_block_reward();
        let previous_hash = self.latest_block().hash.clone();
        let new_id = self.chain.len() as u64;

        println!(
            "  [MINING] Block #{new_id} 채굴 중... (난이도: {}, 보상: {} BTC)",
            self.difficulty, reward
        );
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
        println!(
            "=== Visual Bitcoin Engine (difficulty: {}) ===",
            self.difficulty
        );
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
