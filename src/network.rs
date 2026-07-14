// ============================================================
// network.rs — 여러 노드 + P2P 전파 + "가장 긴 체인" 합의 (교육용)
// ============================================================
// 지금까지의 엔진(blockchain.rs 등)은 "노드 1대의 내부 동작"만 다뤘다.
// 하지만 진짜 비트코인은 수만 대의 노드가 서로 블록을 주고받으며
// "누구의 체인이 진짜인가"를 규칙으로 합의한다.
//
// 이 모듈은 그 핵심을 최소한으로 재현한다.
//   1) 노드 여러 개 — 각자 자기 체인을 가진다 (공유 제네시스에서 출발)
//   2) 채굴       — 특정 노드가 자기 체인 끝에 블록을 붙인다 (아직 자기만 앎)
//   3) 방송(P2P)   — 한 노드가 자기 체인을 이웃에게 퍼뜨린다
//   4) 합의 규칙   — "더 길고 유효한 체인"을 받으면 갈아탄다(reorg).
//                    같은 길이의 다른 블록이면 포크로 공존하다가,
//                    다음 블록이 나오는 쪽이 승리한다.
//
// 여기서 "가장 긴 체인 = 가장 많은 일(PoW)이 쌓인 체인"이며,
// 진 블록은 버려진다(orphan/stale).

use crate::block::{Block, MiningCandidate};
use crate::time::now_secs;
use crate::transaction::Transaction;

// 하나의 노드. 각 노드는 자기만의 체인 사본을 들고 있다.
pub struct Node {
    pub name: String,
    pub chain: Vec<Block>, // [0]은 항상 공유 제네시스
}

// 전체 네트워크(모든 노드 + 로그)를 관리한다.
pub struct Network {
    nodes: Vec<Node>,
    difficulty: usize,
    reward: f64,
    // 화면 하단 "네트워크 로그"에 흘려보낼 사람이 읽는 메시지들.
    logs: Vec<String>,
}

impl Network {
    // 노드들을 만들고, 모두 같은 제네시스에서 출발시킨다.
    // 공유 제네시스가 중요한 이유: 모든 체인이 "같은 뿌리"를 가져야
    // 나중에 서로의 체인을 비교(가장 긴 체인)할 수 있기 때문이다.
    pub fn new(node_names: &[String], difficulty: usize) -> Self {
        let genesis = mine_block(0, vec![], "0".to_string(), difficulty);

        let nodes = node_names
            .iter()
            .map(|name| Node {
                name: name.clone(),
                chain: vec![genesis.clone()],
            })
            .collect();

        let mut net = Network {
            nodes,
            difficulty,
            reward: 50.0,
            logs: Vec::new(),
        };
        net.log(format!(
            "[네트워크] 노드 {}개 생성 · 모두 같은 제네시스({}…)에서 출발",
            node_names.len(),
            short(&genesis.hash),
        ));
        net
    }

    fn log(&mut self, m: String) {
        self.logs.push(m);
    }

    // JS가 로그를 한 번 가져가면 비운다(중복 표시 방지).
    pub fn drain_logs(&mut self) -> Vec<String> {
        std::mem::take(&mut self.logs)
    }

    pub fn nodes(&self) -> &[Node] {
        &self.nodes
    }

    pub fn difficulty(&self) -> usize {
        self.difficulty
    }

    // idx번 노드가 자기 체인 끝에 새 블록을 채굴해 붙인다.
    // 이 시점에는 "자기만" 이 블록을 안다 (아직 전파 전).
    pub fn mine_on(&mut self, idx: usize) {
        let Some(node) = self.nodes.get(idx) else {
            return;
        };
        let prev = node.chain.last().expect("체인은 최소 제네시스를 가진다");
        let id = node.chain.len() as u64;
        let prev_hash = prev.hash.clone();
        let miner = node.name.clone();

        // 코인베이스(채굴 보상)만 담은 블록. 채굴자 이름이 들어가므로
        // 서로 다른 노드가 같은 높이에서 캐도 블록 해시가 자연스럽게 달라진다
        // → 이게 바로 "포크"가 생기는 원리.
        let coinbase = Transaction::coinbase(&miner, self.reward);
        let block = mine_block(id, vec![coinbase], prev_hash, self.difficulty);
        let hash10 = short(&block.hash).to_string();

        self.nodes[idx].chain.push(block);
        self.log(format!(
            "[채굴] {} 가 블록 #{} 생성(hash {}…) — 아직 자기만 알고 있음. 방송해야 퍼진다.",
            miner, id, hash10
        ));
    }

    // from번 노드가 자기 체인을 이웃 모두에게 방송(gossip)한다.
    // 받은 노드는 "가장 긴 체인" 규칙으로 채택 여부를 판단한다.
    pub fn broadcast(&mut self, from: usize) {
        let Some(src_node) = self.nodes.get(from) else {
            return;
        };
        let source = src_node.chain.clone();
        let from_name = src_node.name.clone();

        if !is_valid_chain(&source, self.difficulty) {
            self.log(format!("[방송] {} 의 체인이 무효 → 이웃들이 거부", from_name));
            return;
        }

        self.log(format!(
            "[방송] {} 가 자기 체인(길이 {})을 이웃들에게 전파 📡",
            from_name,
            source.len() - 1
        ));

        let genesis_hash = source[0].hash.clone();

        for i in 0..self.nodes.len() {
            if i == from {
                continue;
            }

            let same_root = self.nodes[i].chain[0].hash == genesis_hash;
            if !same_root {
                let name = self.nodes[i].name.clone();
                self.log(format!("[거부] {} : 제네시스가 달라 남의 체인으로 취급", name));
                continue;
            }

            let mine_len = self.nodes[i].chain.len();
            let their_tip = source.last().unwrap().hash.clone();
            let my_tip = self.nodes[i].chain.last().unwrap().hash.clone();
            let name = self.nodes[i].name.clone();

            if source.len() > mine_len {
                // 더 긴 체인 → 채택. 갈라진 지점 이후의 내 블록은 버려진다.
                let orphaned = orphan_count(&self.nodes[i].chain, &source);
                self.nodes[i].chain = source.clone();
                if orphaned > 0 {
                    self.log(format!(
                        "[재구성] {} : 더 긴 체인 채택(길이 {}→{}) · 내 블록 {}개 버려짐(orphan) ⚠️",
                        name,
                        mine_len - 1,
                        source.len() - 1,
                        orphaned
                    ));
                } else {
                    self.log(format!(
                        "[동기화] {} : 뒤처진 체인을 따라잡음(길이 {}→{})",
                        name,
                        mine_len - 1,
                        source.len() - 1
                    ));
                }
            } else if source.len() == mine_len && their_tip != my_tip {
                // 같은 길이의 다른 끝 → 포크 공존. 규칙상 "먼저 본 것"을 유지한다.
                self.log(format!(
                    "[포크 유지] {} : 같은 길이({})의 다른 블록 → 기존 것 유지. 다음 블록이 승부를 가른다.",
                    name,
                    mine_len - 1
                ));
            }
            // source가 더 짧으면 받는 쪽이 이미 더 기니 무시(로그 생략).
        }
    }
}

// ============================================================
// 내부 헬퍼들
// ============================================================

// stdout 출력 없이 블록을 채굴한다(brower/wasm 친화적).
// attack.rs(이중지불 데모)에서도 재사용하므로 crate 안에 공개한다.
pub(crate) fn mine_block(id: u64, txs: Vec<Transaction>, prev: String, difficulty: usize) -> Block {
    let ts = now_secs();
    let mut candidate = MiningCandidate::new(id, ts, txs, prev, difficulty);
    loop {
        if let Some(block) = candidate.try_batch(500_000) {
            return block;
        }
    }
}

// 체인 유효성: 제네시스 이후 모든 블록이
//   (1) 해시가 필드로부터 재계산한 값과 일치하고
//   (2) previous_hash가 앞 블록의 hash와 연결되며
//   (3) PoW(선행 0의 개수) 조건을 만족하는지
// 검사한다. 하나라도 어기면 무효.
fn is_valid_chain(chain: &[Block], _difficulty: usize) -> bool {
    if chain.is_empty() {
        return false;
    }
    for i in 1..chain.len() {
        let b = &chain[i];
        if b.hash != b.recalculate_hash() {
            return false;
        }
        if b.previous_hash != chain[i - 1].hash {
            return false;
        }
        if !b.hash.starts_with(&"0".repeat(b.difficulty)) {
            return false;
        }
    }
    true
}

// 내 체인이 incoming 체인으로 갈아탈 때, 공통 조상 이후로
// "버려지는 내 블록" 개수를 센다.
fn orphan_count(mine: &[Block], incoming: &[Block]) -> usize {
    let mut common = 0;
    while common < mine.len()
        && common < incoming.len()
        && mine[common].hash == incoming[common].hash
    {
        common += 1;
    }
    mine.len() - common
}

// 해시 앞 10글자만 (로그용).
fn short(hash: &str) -> &str {
    if hash.len() >= 10 {
        &hash[..10]
    } else {
        hash
    }
}
