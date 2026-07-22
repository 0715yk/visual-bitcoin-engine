// ============================================================
// staking.rs — 밸리데이터 스테이킹 · 슬래싱
// ============================================================

use serde::Serialize;
use std::collections::HashMap;

/// 실제 ETH는 32 ETH. 교육용도 동일.
pub const STAKE_ETH: f64 = 32.0;

#[derive(Clone, Debug, Serialize, PartialEq)]
pub enum ValidatorStatus {
    Pending,
    Active,
    Slashed,
    Exited,
}

#[derive(Clone, Debug, Serialize)]
pub struct Validator {
    pub id: u32,
    pub label: String,
    pub stake_eth: f64,
    pub status: ValidatorStatus,
    pub effective_balance: f64,
}

#[derive(Default)]
pub struct StakingRegistry {
    next_id: u32,
    validators: HashMap<u32, Validator>,
    by_label: HashMap<String, u32>,
    logs: Vec<String>,
}

impl StakingRegistry {
    pub fn new() -> Self {
        let mut reg = Self::default();
        // 기본 밸리데이터 세트
        for name in ["Val-A", "Val-B", "Val-C", "Val-D", "Val-E"] {
            let _ = reg.deposit(name, STAKE_ETH);
            if let Some(id) = reg.by_label.get(name).copied() {
                let _ = reg.activate(id);
            }
        }
        reg
    }

    pub fn deposit(&mut self, label: &str, eth: f64) -> Result<u32, String> {
        if eth + 1e-9 < STAKE_ETH {
            return Err(format!(
                "최소 스테이크는 {} ETH 입니다 (입력: {:.3})",
                STAKE_ETH, eth
            ));
        }
        if self.by_label.contains_key(label) {
            return Err(format!("이미 등록된 라벨: {}", label));
        }
        let id = self.next_id;
        self.next_id += 1;
        self.validators.insert(
            id,
            Validator {
                id,
                label: label.to_string(),
                stake_eth: eth,
                status: ValidatorStatus::Pending,
                effective_balance: eth,
            },
        );
        self.by_label.insert(label.to_string(), id);
        self.logs
            .push(format!("[DEPOSIT] {} 스테이크 {:.1} ETH → validator #{}", label, eth, id));
        Ok(id)
    }

    pub fn activate(&mut self, id: u32) -> Result<(), String> {
        let v = self
            .validators
            .get_mut(&id)
            .ok_or_else(|| format!("없는 validator #{}", id))?;
        if v.status == ValidatorStatus::Slashed {
            return Err("슬래시된 밸리데이터는 활성화할 수 없습니다.".into());
        }
        v.status = ValidatorStatus::Active;
        self.logs
            .push(format!("[ACTIVATE] #{} ({}) 활성화", id, v.label));
        Ok(())
    }

    /// 이중서명 등 → 슬래시 (잔고 일부 소각)
    pub fn slash(&mut self, id: u32, reason: &str, fraction: f64) -> Result<(), String> {
        let v = self
            .validators
            .get_mut(&id)
            .ok_or_else(|| format!("없는 validator #{}", id))?;
        let cut = (v.effective_balance * fraction).max(1.0);
        v.effective_balance = (v.effective_balance - cut).max(0.0);
        v.status = ValidatorStatus::Slashed;
        self.logs.push(format!(
            "[SLASH] #{} ({}) — {} | -{:.2} ETH → 잔고 {:.2}",
            id, v.label, reason, cut, v.effective_balance
        ));
        Ok(())
    }

    /// 오프라인 페널티 (inactivity leak 맛보기)
    pub fn inactivity_penalty(&mut self, id: u32, amount: f64) -> Result<(), String> {
        let v = self
            .validators
            .get_mut(&id)
            .ok_or_else(|| format!("없는 validator #{}", id))?;
        if v.status != ValidatorStatus::Active {
            return Err("활성 밸리데이터만 오프라인 페널티를 받습니다.".into());
        }
        v.effective_balance = (v.effective_balance - amount).max(0.0);
        self.logs.push(format!(
            "[OFFLINE] #{} ({}) inactivity -{:.3} ETH → {:.2}",
            id, v.label, amount, v.effective_balance
        ));
        Ok(())
    }

    pub fn active_ids(&self) -> Vec<u32> {
        let mut ids: Vec<_> = self
            .validators
            .values()
            .filter(|v| v.status == ValidatorStatus::Active)
            .map(|v| v.id)
            .collect();
        ids.sort();
        ids
    }

    pub fn effective_balance(&self, id: u32) -> f64 {
        self.validators
            .get(&id)
            .map(|v| v.effective_balance)
            .unwrap_or(0.0)
    }

    pub fn label_of(&self, id: u32) -> String {
        self.validators
            .get(&id)
            .map(|v| v.label.clone())
            .unwrap_or_else(|| format!("#{}", id))
    }

    pub fn snapshot(&self) -> Vec<Validator> {
        let mut v: Vec<_> = self.validators.values().cloned().collect();
        v.sort_by_key(|x| x.id);
        v
    }

    pub fn drain_logs(&mut self) -> Vec<String> {
        std::mem::take(&mut self.logs)
    }
}
