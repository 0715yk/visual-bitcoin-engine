// ============================================================
// blockchain.rs — Blockchain 구조체와 검증/조작 로직을 담당하는 모듈
// ============================================================

// crate::block → "우리 프로젝트(crate) 안의 block.rs"에서 Block을 가져온다.
// JavaScript로 치면: import { Block } from './block.js'
use crate::block::Block;

pub struct Blockchain {
    // pub(crate) = 우리 프로젝트 내부에서만 공개.
    // 외부 라이브러리에서는 직접 접근 못 하고, 우리 코드에서만 쓸 수 있다.
    pub(crate) chain: Vec<Block>,
}

impl Blockchain {
    // 제네시스 블록을 포함한 새 블록체인 생성
    pub fn new() -> Self {
        let genesis = Block::new(0, "Genesis Block".to_string(), "0".to_string());
        Blockchain {
            chain: vec![genesis],
        }
    }

    // 체인의 마지막 블록을 가져온다
    pub fn latest_block(&self) -> &Block {
        self.chain.last().expect("Chain must have at least one block")
    }

    // 새 블록을 체인 끝에 추가
    pub fn add_block(&mut self, data: String) {
        let previous_hash = self.latest_block().hash.clone();
        let new_id = self.chain.len() as u64;
        let block = Block::new(new_id, data, previous_hash);
        self.chain.push(block);
    }

    // ============================================================
    // validate_chain() — 체인 전체가 조작되지 않았는지 검증한다.
    // ============================================================
    //
    // 검증하는 2가지:
    //   1. 각 블록의 hash가 내용물과 일치하는가?
    //      → 블록 내용을 다시 해시 돌려서, 저장된 해시와 비교
    //      → 누가 data를 바꿨으면 해시가 달라지므로 여기서 걸린다
    //
    //   2. 각 블록의 previous_hash가 이전 블록의 hash와 일치하는가?
    //      → 체인이 제대로 연결되어 있는지 확인
    //      → 중간 블록이 바뀌면 뒤의 연결이 끊어지므로 여기서 걸린다
    //
    // 반환값:
    //   true  = 체인이 정상 (아무도 조작 안 함)
    //   false = 체인이 조작됨 (누가 데이터를 바꿨다!)
    pub fn validate_chain(&self) -> bool {
        // i는 1부터 시작 (0번 제네시스 블록은 이전 블록이 없으므로 건너뜀)
        // 1..self.chain.len()은 JavaScript의 for(let i = 1; i < chain.length; i++)
        for i in 1..self.chain.len() {
            let current = &self.chain[i];       // 현재 블록
            let previous = &self.chain[i - 1];  // 바로 이전 블록

            // 검증 1: 블록의 내용을 다시 해시 돌려서, 저장된 해시와 비교
            let recalculated = current.recalculate_hash();
            if current.hash != recalculated {
                println!("  [FAIL] Block #{} 해시 불일치!", current.id);
                println!("         저장된 해시: {}...", &current.hash[..16]);
                println!("         다시 계산:   {}...", &recalculated[..16]);
                println!("         → 누군가 이 블록의 데이터를 조작했다!");
                return false;
            }

            // 검증 2: 현재 블록의 previous_hash가 이전 블록의 hash와 일치하는지
            if current.previous_hash != previous.hash {
                println!("  [FAIL] Block #{} 체인 연결 끊김!", current.id);
                println!("         이 블록의 prev_hash: {}...", &current.previous_hash[..16]);
                println!("         이전 블록의 hash:     {}...", &previous.hash[..16]);
                println!("         → 이전 블록이 조작되어 체인이 끊어졌다!");
                return false;
            }
        }

        true
    }

    // ============================================================
    // tamper_block() — 특정 블록의 데이터를 강제로 조작한다. (시뮬레이션용)
    // ============================================================
    //
    // 실제 블록체인에서는 이런 일이 일어나면 안 된다.
    // 이 함수는 "조작하면 어떻게 되는지" 보여주기 위한 교육용 함수이다.
    //
    // 매개변수:
    //   index: usize — 조작할 블록 번호 (usize는 배열 인덱스에 쓰는 양의 정수 타입)
    //   new_data: String — 바꿔치기할 가짜 데이터
    pub fn tamper_block(&mut self, index: usize, new_data: String) {
        // index가 배열 범위를 벗어나거나, 제네시스 블록(0번)이면 무시
        if index == 0 || index >= self.chain.len() {
            println!("  [ERROR] Block #{index}은 조작할 수 없다.");
            return;
        }

        println!("  [TAMPER] Block #{index}의 데이터를 조작한다!");
        println!("           원래: \"{}\"", self.chain[index].data);
        println!("           조작: \"{new_data}\"");

        // 데이터만 바꾸고, 해시는 그대로 둔다.
        // 이렇게 하면 해시와 실제 내용이 안 맞게 되어 검증에서 걸린다.
        self.chain[index].data = new_data;
    }

    // 전체 체인을 보기 좋게 출력
    pub fn print_chain(&self) {
        println!("=== Visual Bitcoin Engine ===");
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
