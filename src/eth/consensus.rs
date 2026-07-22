// ============================================================
// consensus.rs — 교육용 Gasper 라이트
// ============================================================
// - 슬롯(12초 개념)마다 제안자 1명 (의사난수)
// - attest: 활성 밸리데이터가 헤드에 가중치 투표
// - LMD-GHOST 맛보기: 가중치 합이 큰 체인을 헤드로
// - Casper FFG 맛보기: 에포크 체크포인트에 2/3 스테이크 → finalized
// 스펙 호환 아님.

use serde::Serialize;
use std::collections::HashMap;

use super::staking::StakingRegistry;

pub const SLOTS_PER_EPOCH: u64 = 8; // 실제는 32. 교육용으로 짧게.
pub const SUPERMAJORITY: f64 = 2.0 / 3.0;

#[derive(Clone, Debug, Serialize)]
pub struct BlockView {
    pub slot: u64,
    pub parent_slot: Option<u64>,
    pub proposer: String,
    pub proposer_id: u32,
    pub hash: String,
    pub state_root: String,
    pub attest_weight: f64,
    /// 이 블록에 attest(찬성 투표)한 validator 라벨들
    pub attesters: Vec<String>,
    /// 이 슬롯에 오프라인이라 투표하지 못한 validator 라벨들
    pub offline: Vec<String>,
    pub justified: bool,
    pub finalized: bool,
}

#[derive(Clone, Debug)]
struct Block {
    slot: u64,
    parent_slot: Option<u64>,
    proposer_id: u32,
    hash: String,
    /// 이 블록이 실행된 뒤의 world state 지문 (교육용)
    state_root: String,
    /// 이 블록을 헤드로 지목한 attest 가중치 합
    weight: f64,
    /// attest 한 validator id 목록 (교육용 시각화)
    attesters: Vec<u32>,
    /// 오프라인으로 빠진 validator id 목록
    offline: Vec<u32>,
}

#[derive(Serialize)]
pub struct PosSnapshot {
    pub slot: u64,
    pub epoch: u64,
    pub head_slot: Option<u64>,
    pub justified_epoch: i64,
    pub finalized_epoch: i64,
    pub blocks: Vec<BlockView>,
    pub last_proposer: Option<String>,
    pub message: String,
}

pub struct PosChain {
    staking: StakingRegistry,
    slot: u64,
    blocks: HashMap<u64, Block>,
    head_slot: Option<u64>,
    /// epoch → 체크포인트에 모인 스테이크 가중치
    epoch_votes: HashMap<u64, f64>,
    justified_epoch: i64,
    finalized_epoch: i64,
    logs: Vec<String>,
    rng_state: u64,
}

impl PosChain {
    pub fn new() -> Self {
        let mut chain = Self {
            staking: StakingRegistry::new(),
            slot: 0,
            blocks: HashMap::new(),
            head_slot: None,
            epoch_votes: HashMap::new(),
            justified_epoch: -1,
            finalized_epoch: -1,
            logs: Vec::new(),
            rng_state: 0xC0FFEE,
        };
        // 제네시스
        chain.blocks.insert(
            0,
            Block {
                slot: 0,
                parent_slot: None,
                proposer_id: 0,
                hash: "0xgenesis".into(),
                state_root: String::new(),
                weight: 0.0,
                attesters: Vec::new(),
                offline: Vec::new(),
            },
        );
        chain.head_slot = Some(0);
        chain.logs.push("[GENESIS] 슬롯 0 제네시스 블록".into());
        chain
    }

    pub fn staking_mut(&mut self) -> &mut StakingRegistry {
        &mut self.staking
    }

    pub fn staking(&self) -> &StakingRegistry {
        &self.staking
    }

    fn next_rand(&mut self) -> u64 {
        // xorshift64*
        let mut x = self.rng_state;
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        self.rng_state = x;
        x
    }

    fn pick_proposer(&mut self) -> Option<u32> {
        let ids = self.staking.active_ids();
        if ids.is_empty() {
            return None;
        }
        let i = (self.next_rand() as usize) % ids.len();
        Some(ids[i])
    }

    /// 다음 슬롯으로 진행: 제안 → 자동 attest(전원 또는 일부) → 헤드/파이널리티 갱신
    /// `state_root`: 이 슬롯 시점의 world state 지문 (WasmEth 가 계산해 넘김)
    pub fn advance_slot(&mut self, offline_fraction: f64, state_root: &str) -> Result<String, String> {
        let parent = self.head_slot.ok_or("헤드 없음")?;
        let proposer = self
            .pick_proposer()
            .ok_or_else(|| "활성 밸리데이터가 없습니다.".to_string())?;
        let new_slot = self.slot + 1;
        let hash = format!(
            "0x{:016x}",
            self.next_rand() ^ (new_slot.wrapping_mul(0x9E37) << 16)
        );

        self.blocks.insert(
            new_slot,
            Block {
                slot: new_slot,
                parent_slot: Some(parent),
                proposer_id: proposer,
                hash: hash.clone(),
                state_root: state_root.to_string(),
                weight: 0.0,
                attesters: Vec::new(),
                offline: Vec::new(),
            },
        );
        self.slot = new_slot;

        let label = self.staking.label_of(proposer);
        self.logs.push(format!(
            "[PROPOSE] 슬롯 {} · 제안자 {} (#{}) · {}",
            new_slot,
            label,
            proposer,
            &hash[..hash.len().min(18)]
        ));

        // Attest: 활성 밸리데이터가 새 블록을 헤드로 지지 (offline_fraction 만큼 빠짐)
        let active = self.staking.active_ids();
        let mut weight = 0.0;
        let mut attesters: Vec<u32> = Vec::new();
        let mut offline: Vec<u32> = Vec::new();
        let skip_n = ((active.len() as f64) * offline_fraction.clamp(0.0, 0.9)).round() as usize;
        for (i, &vid) in active.iter().enumerate() {
            if i < skip_n {
                offline.push(vid);
                continue;
            }
            weight += self.staking.effective_balance(vid);
            attesters.push(vid);
        }
        if let Some(b) = self.blocks.get_mut(&new_slot) {
            b.weight += weight;
            b.attesters = attesters.clone();
            b.offline = offline.clone();
        }
        self.logs.push(format!(
            "[ATTEST] 슬롯 {} · 가중치 {:.1} ETH (오프라인 비율 {:.0}%)",
            new_slot,
            weight,
            offline_fraction * 100.0
        ));

        self.recompute_head();
        self.try_finalize();

        Ok(format!("슬롯 {} 제안·attest 완료", new_slot))
    }

    /// LMD-GHOST 맛보기: 리프 중 가중치(자신+조상 누적 아님, 블록 로컬 weight) 최대를 헤드로.
    /// 단순화: 최신 슬롯 체인을 따라가되, 포크가 있으면 weight 큰 쪽.
    fn recompute_head(&mut self) {
        // 교육용: 가장 높은 슬롯의 블록을 기본 헤드로 (단일 체인 MVP).
        // 포크 시나리오용: weight가 더 큰 형제 선택.
        let mut best_slot = 0u64;
        let mut best_w = -1.0f64;
        for b in self.blocks.values() {
            let score = b.weight + b.slot as f64 * 0.001; // 동점이면 더 최신
            if score > best_w {
                best_w = score;
                best_slot = b.slot;
            }
        }
        self.head_slot = Some(best_slot);
    }

    fn try_finalize(&mut self) {
        let epoch = self.slot / SLOTS_PER_EPOCH;
        if epoch == 0 {
            return;
        }
        // 현재 에포크에 쌓인 attest 가중치
        let mut epoch_w = 0.0;
        let start = epoch * SLOTS_PER_EPOCH;
        for s in start..=self.slot {
            if let Some(b) = self.blocks.get(&s) {
                epoch_w += b.weight;
            }
        }
        self.epoch_votes.insert(epoch, epoch_w);

        let total_active: f64 = self
            .staking
            .active_ids()
            .iter()
            .map(|&id| self.staking.effective_balance(id))
            .sum::<f64>()
            * (SLOTS_PER_EPOCH as f64); // 슬롯마다 attest 가정

        if total_active <= 0.0 {
            return;
        }
        let ratio = epoch_w / total_active;
        if ratio >= SUPERMAJORITY {
            if self.justified_epoch < epoch as i64 {
                self.justified_epoch = epoch as i64;
                self.logs.push(format!(
                    "[JUSTIFY] 에포크 {} justified (투표 {:.0}%)",
                    epoch,
                    ratio * 100.0
                ));
            }
            // 직전 justified 에포크를 finalize (FFG 맛보기)
            let prev = epoch as i64 - 1;
            if prev >= 0 && self.justified_epoch >= prev && self.finalized_epoch < prev {
                self.finalized_epoch = prev;
                self.logs
                    .push(format!("[FINALIZE] 에포크 {} finalized ✅", prev));
                // 해당 에포크 블록들 finalized 표시는 snapshot에서 계산
            }
        }
    }

    /// 공격 시뮬: 같은 슬롯에 경쟁 블록을 붙여 포크 생성
    pub fn fork_attack(&mut self, attacker_id: u32) -> Result<String, String> {
        let parent = self.head_slot.ok_or("헤드 없음")?;
        // 슬롯 키를 +1000 오프셋으로 두어 포크 분기를 시각화 (교육용)
        let mut rival = self.slot + 1000;
        while self.blocks.contains_key(&rival) {
            rival += 1;
        }
        let hash = format!("0xevil{:012x}", self.next_rand());
        let w = self.staking.effective_balance(attacker_id);
        // 포크 블록은 부모와 같은 state 를 주장한다고 가정 (교육용)
        let parent_root = self
            .blocks
            .get(&parent)
            .map(|b| b.state_root.clone())
            .unwrap_or_default();
        self.blocks.insert(
            rival,
            Block {
                slot: rival,
                parent_slot: Some(parent),
                proposer_id: attacker_id,
                hash,
                state_root: parent_root,
                weight: w,
                attesters: vec![attacker_id],
                offline: Vec::new(),
            },
        );
        // 이중 제안으로 슬래시
        let _ = self.staking.slash(attacker_id, "이중 제안(equivocation)", 0.05);
        self.recompute_head();
        let msg = format!(
            "포크 블록 슬롯-키 {} 생성. 공격자 #{} 슬래시. 헤드={:?}",
            rival, attacker_id, self.head_slot
        );
        self.logs.push(format!("[FORK] {}", msg));
        Ok(msg)
    }

    pub fn snapshot(&self) -> PosSnapshot {
        let epoch = self.slot / SLOTS_PER_EPOCH;
        let mut blocks: Vec<BlockView> = self
            .blocks
            .values()
            .map(|b| {
                let ep = b.slot / SLOTS_PER_EPOCH;
                BlockView {
                    slot: b.slot,
                    parent_slot: b.parent_slot,
                    proposer: self.staking.label_of(b.proposer_id),
                    proposer_id: b.proposer_id,
                    hash: b.hash.clone(),
                    state_root: b.state_root.clone(),
                    attest_weight: b.weight,
                    attesters: b.attesters.iter().map(|&id| self.staking.label_of(id)).collect(),
                    offline: b.offline.iter().map(|&id| self.staking.label_of(id)).collect(),
                    justified: self.justified_epoch >= 0 && ep as i64 <= self.justified_epoch,
                    finalized: self.finalized_epoch >= 0 && ep as i64 <= self.finalized_epoch,
                }
            })
            .collect();
        blocks.sort_by_key(|b| b.slot);

        let last_proposer = self
            .blocks
            .get(&self.slot)
            .map(|b| self.staking.label_of(b.proposer_id));

        PosSnapshot {
            slot: self.slot,
            epoch,
            head_slot: self.head_slot,
            justified_epoch: self.justified_epoch,
            finalized_epoch: self.finalized_epoch,
            blocks,
            last_proposer,
            message: format!(
                "슬롯 {} · 에포크 {} · 헤드 {:?} · justified={} · finalized={}",
                self.slot,
                epoch,
                self.head_slot,
                self.justified_epoch,
                self.finalized_epoch
            ),
        }
    }

    pub fn drain_logs(&mut self) -> Vec<String> {
        let mut all = self.staking.drain_logs();
        all.append(&mut self.logs);
        all
    }
}

impl Default for PosChain {
    fn default() -> Self {
        Self::new()
    }
}
