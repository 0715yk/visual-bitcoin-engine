// ============================================================
// account.rs — 계정 모델 (잔액 · nonce · 가스)
// ============================================================
// UTXO가 아니라 (address → balance, nonce) 맵. ERC-20은 단순 잔액 맵.

use serde::Serialize;
use std::collections::HashMap;

use super::keccak::address_from_label;

#[derive(Clone, Debug, Serialize)]
pub struct Account {
    pub label: String,
    pub address: String,
    pub balance_wei: u64, // 교육용: 1 ETH = 1_000_000_000 "milli" (간이). 실제는 wei.
    pub nonce: u64,
}

/// 간이 단위: 화면에서는 ETH로 나누어 보여준다 (1e9 = 1 ETH)
pub const UNIT_PER_ETH: u64 = 1_000_000_000;

#[derive(Clone, Debug, Serialize)]
pub struct TxReceipt {
    pub ok: bool,
    pub error: Option<String>,
    pub from: String,
    pub to: String,
    pub value_eth: f64,
    pub gas_used: u64,
    pub nonce: u64,
    /// EIP-1559: gas_used × base_fee → 소각
    pub base_fee_burned_eth: f64,
    /// EIP-1559: gas_used × priority_fee → 블록 제안자
    pub tip_eth: f64,
    pub proposer: String,
}

#[derive(Default)]
pub struct AccountLedger {
    accounts: HashMap<String, Account>, // key = label
    logs: Vec<String>,
}

impl AccountLedger {
    pub fn new() -> Self {
        let mut ledger = Self::default();
        // 시드 계정
        ledger.fund("Alice", 100.0);
        ledger.fund("Bob", 50.0);
        ledger.fund("Carol", 10.0);
        ledger
    }

    pub fn ensure(&mut self, label: &str) -> &mut Account {
        if !self.accounts.contains_key(label) {
            let addr = address_from_label(label);
            self.accounts.insert(
                label.to_string(),
                Account {
                    label: label.to_string(),
                    address: addr,
                    balance_wei: 0,
                    nonce: 0,
                },
            );
        }
        self.accounts.get_mut(label).unwrap()
    }

    /// 교육용 "발행" — faucet
    pub fn fund(&mut self, label: &str, eth: f64) {
        let amt = (eth * UNIT_PER_ETH as f64) as u64;
        let acc = self.ensure(label);
        acc.balance_wei = acc.balance_wei.saturating_add(amt);
        self.logs
            .push(format!("[FAUCET] {} 에게 {:.3} ETH 지급", label, eth));
    }

    /// 계정 간 ETH 전송 — 더머지 이후 EIP-1559 수수료 모델
    /// - base_fee_per_gas × gas → 소각(burn)
    /// - priority_fee_per_gas × gas → 블록 제안자(밸리데이터)
    pub fn transfer(
        &mut self,
        from: &str,
        to: &str,
        eth: f64,
        base_fee_per_gas: u64,
        priority_fee_per_gas: u64,
        proposer: &str,
    ) -> TxReceipt {
        let value = (eth * UNIT_PER_ETH as f64) as u64;
        let gas_used = 21_000u64; // 단순 ETH 전송
        let base_part = gas_used.saturating_mul(base_fee_per_gas);
        let tip_part = gas_used.saturating_mul(priority_fee_per_gas);
        let fee = base_part.saturating_add(tip_part);
        let empty = || TxReceipt {
            ok: false,
            error: None,
            from: from.into(),
            to: to.into(),
            value_eth: eth,
            gas_used: 0,
            nonce: 0,
            base_fee_burned_eth: 0.0,
            tip_eth: 0.0,
            proposer: proposer.into(),
        };

        if from.is_empty() || to.is_empty() {
            let mut r = empty();
            r.error = Some("보내는/받는 주소가 비어 있습니다.".into());
            return r;
        }

        self.ensure(from);
        self.ensure(to);
        if !proposer.is_empty() {
            self.ensure(proposer);
        }

        let from_bal = self.accounts.get(from).unwrap().balance_wei;
        let need = value.saturating_add(fee);
        if from_bal < need {
            let err = format!(
                "잔액 부족: 보유 {:.6} ETH, 필요 {:.6} ETH (value + base fee 소각 + tip)",
                from_bal as f64 / UNIT_PER_ETH as f64,
                need as f64 / UNIT_PER_ETH as f64
            );
            self.logs.push(format!("[REJECTED] {}", err));
            let mut r = empty();
            r.error = Some(err);
            r.nonce = self.accounts.get(from).unwrap().nonce;
            return r;
        }

        let nonce = {
            let a = self.accounts.get_mut(from).unwrap();
            let n = a.nonce;
            a.balance_wei -= need;
            a.nonce += 1;
            n
        };
        {
            let b = self.accounts.get_mut(to).unwrap();
            b.balance_wei = b.balance_wei.saturating_add(value);
        }
        // tip → 제안자 (base fee는 소각이므로 누구에게도 지급하지 않음)
        if tip_part > 0 && !proposer.is_empty() {
            let p = self.accounts.get_mut(proposer).unwrap();
            p.balance_wei = p.balance_wei.saturating_add(tip_part);
        }

        let base_eth = base_part as f64 / UNIT_PER_ETH as f64;
        let tip_eth = tip_part as f64 / UNIT_PER_ETH as f64;
        self.logs.push(format!(
            "[TX] {} → {}: {:.3} ETH | nonce={} gas={} | base fee 소각 {:.6} ETH · tip → {} {:.6} ETH",
            from, to, eth, nonce, gas_used, base_eth, proposer, tip_eth
        ));

        TxReceipt {
            ok: true,
            error: None,
            from: from.into(),
            to: to.into(),
            value_eth: eth,
            gas_used,
            nonce,
            base_fee_burned_eth: base_eth,
            tip_eth,
            proposer: proposer.into(),
        }
    }

    // ----- 컨트랙트 트랜잭션 지원 -----

    pub fn address_of(&mut self, label: &str) -> String {
        self.ensure(label).address.clone()
    }

    pub fn nonce_of(&mut self, label: &str) -> u64 {
        self.ensure(label).nonce
    }

    pub fn balance_wei_of(&mut self, label: &str) -> u64 {
        self.ensure(label).balance_wei
    }

    pub fn credit_wei(&mut self, label: &str, wei: u64) {
        let a = self.ensure(label);
        a.balance_wei = a.balance_wei.saturating_add(wei);
    }

    /// 컨트랙트 배포/호출 비용 정산.
    /// charge_value=false 면 revert 케이스: value 는 돌려주고 gas fee 만 차감.
    /// 반환: (사용한 nonce, burn_wei, tip_wei)
    pub fn apply_contract_tx(
        &mut self,
        from: &str,
        value_wei: u64,
        gas_used: u64,
        base_fee_per_gas: u64,
        priority_fee_per_gas: u64,
        proposer: &str,
        charge_value: bool,
    ) -> Result<(u64, u64, u64), String> {
        let burn = gas_used.saturating_mul(base_fee_per_gas);
        let tip = gas_used.saturating_mul(priority_fee_per_gas);
        let need = if charge_value {
            value_wei.saturating_add(burn).saturating_add(tip)
        } else {
            burn.saturating_add(tip)
        };
        self.ensure(from);
        if !proposer.is_empty() {
            self.ensure(proposer);
        }
        let a = self.accounts.get_mut(from).unwrap();
        if a.balance_wei < need {
            return Err(format!(
                "잔액 부족: 보유 {:.6} ETH, 필요 {:.6} ETH (value + gas fee)",
                a.balance_wei as f64 / UNIT_PER_ETH as f64,
                need as f64 / UNIT_PER_ETH as f64
            ));
        }
        let nonce = a.nonce;
        a.balance_wei -= need;
        a.nonce += 1;
        if tip > 0 && !proposer.is_empty() {
            let p = self.accounts.get_mut(proposer).unwrap();
            p.balance_wei = p.balance_wei.saturating_add(tip);
        }
        Ok((nonce, burn, tip))
    }

    pub fn snapshot(&self) -> Vec<Account> {
        let mut v: Vec<_> = self.accounts.values().cloned().collect();
        v.sort_by(|a, b| a.label.cmp(&b.label));
        v
    }

    pub fn drain_logs(&mut self) -> Vec<String> {
        std::mem::take(&mut self.logs)
    }
}
