// ============================================================
// contract.rs — canned 스마트 컨트랙트 엔진 (교육용, EVM 바이트코드 없음)
// ============================================================
// 실제 규칙을 최대한 따른다:
// - 컨트랙트 주소 = keccak(deployer_addr ‖ nonce) 끝 20바이트 (CREATE 근사)
// - 이벤트 topic0 = keccak(시그니처 문자열)
// - revert 되어도 gas 는 소모됨 (호출측에서 fee 부과)
// 종류: Vending(자판기 에스크로) · Erc20 · PriceFeed(oracle) · Insurance(feed 소비자) · Escrow(부동산 매매)

use serde::Serialize;
use std::collections::BTreeMap;

use super::keccak::{contract_address, keccak256_str};
use crate::eth::account::UNIT_PER_ETH;

// ---------- 이벤트 ----------

#[derive(Clone, Debug, Serialize)]
pub struct Event {
    pub contract: String,
    pub contract_name: String,
    pub name: String,
    pub signature: String,
    /// keccak256(signature) 전체 hex — 실제 로그의 topic0
    pub topic0: String,
    pub args: Vec<(String, String)>,
}

impl Event {
    fn new(c: &Contract, name: &str, signature: &str, args: Vec<(String, String)>) -> Self {
        Event {
            contract: c.address.clone(),
            contract_name: c.name.clone(),
            name: name.into(),
            signature: signature.into(),
            topic0: keccak256_str(signature),
            args,
        }
    }
}

// ---------- 컨트랙트 ----------

#[derive(Clone, Debug, Serialize)]
pub struct Contract {
    pub address: String,
    pub kind: String, // "vending" | "erc20" | "pricefeed" | "insurance" | "escrow"
    pub name: String,
    pub deployer: String,
    pub created_nonce: u64,
    pub balance_wei: u64,
    /// 사람이 읽는 스토리지 슬롯 (교육용 표현)
    pub storage: BTreeMap<String, String>,
}

/// call 실행 결과 — 호출측(wasm_api)이 계정 원장에 반영한다
pub struct CallOutcome {
    pub gas_used: u64,
    pub note: String,
    pub events: Vec<Event>,
    /// 컨트랙트 잔액에서 EOA 로 나간 지급 (label, wei)
    pub payouts: Vec<(String, u64)>,
}

#[derive(Debug)]
pub struct RevertError {
    pub gas_used: u64,
    pub reason: String,
}

fn eth_to_wei(eth: f64) -> u64 {
    (eth.max(0.0) * UNIT_PER_ETH as f64).round() as u64
}
fn wei_to_eth(wei: u64) -> f64 {
    wei as f64 / UNIT_PER_ETH as f64
}
fn fmt_eth(wei: u64) -> String {
    format!("{:.6} ETH", wei_to_eth(wei))
}

// ---------- gas 테이블 (메인넷 근사치) ----------

pub fn deploy_gas(kind: &str) -> u64 {
    match kind {
        "vending" => 300_000,
        "erc20" => 900_000,
        "pricefeed" => 450_000,
        "insurance" => 380_000,
        "escrow" => 350_000,
        _ => 200_000,
    }
}

pub fn call_gas(kind: &str, func: &str) -> u64 {
    match (kind, func) {
        ("vending", "buy") => 60_000,
        ("vending", "withdraw") => 30_000,
        ("erc20", "transfer") => 51_000,
        ("pricefeed", "report") => 43_000,
        ("insurance", "buy_policy") => 65_000,
        ("insurance", "settle") => 80_000,
        ("escrow", "deposit") => 55_000,
        ("escrow", "confirm") => 30_000,
        ("escrow", "release") => 45_000,
        ("escrow", "refund") => 40_000,
        // 존재하지 않는 함수 → 즉시 revert 지만 기본 gas 는 태움
        _ => 23_000,
    }
}

// ---------- 레지스트리 ----------

#[derive(Default)]
pub struct ContractRegistry {
    contracts: Vec<Contract>,
    events: Vec<Event>,
    logs: Vec<String>,
}

impl ContractRegistry {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn find(&self, address: &str) -> Option<&Contract> {
        self.contracts.iter().find(|c| c.address == address)
    }

    fn find_idx(&self, address: &str) -> Option<usize> {
        self.contracts.iter().position(|c| c.address == address)
    }

    /// 이름으로도 찾기 (UI 편의: "SAND")
    pub fn find_by_name(&self, name: &str) -> Option<&Contract> {
        self.contracts.iter().find(|c| c.name == name)
    }

    pub fn kind_of(&self, address: &str) -> Option<String> {
        self.find(address).map(|c| c.kind.clone())
    }

    pub fn snapshot(&self) -> &Vec<Contract> {
        &self.contracts
    }

    pub fn events(&self) -> &Vec<Event> {
        &self.events
    }

    pub fn drain_logs(&mut self) -> Vec<String> {
        std::mem::take(&mut self.logs)
    }

    // ---------- 배포 ----------

    /// deployer_addr + nonce 로 CREATE 주소를 만들고 종류별 초기 스토리지를 세팅한다.
    /// value_wei 는 payable constructor 로 컨트랙트에 예치 (Insurance 지급 풀 등).
    pub fn deploy(
        &mut self,
        kind: &str,
        deployer: &str,
        deployer_addr: &str,
        nonce: u64,
        args: &serde_json::Value,
        value_wei: u64,
    ) -> Result<String, String> {
        let address = contract_address(deployer_addr, nonce);
        if self.find(&address).is_some() {
            return Err("이미 존재하는 주소입니다.".into());
        }
        let mut storage = BTreeMap::new();
        let name;
        match kind {
            "vending" => {
                let price = args.get("priceEth").and_then(|v| v.as_f64()).unwrap_or(0.5);
                let stock = args.get("stock").and_then(|v| v.as_u64()).unwrap_or(5);
                if price <= 0.0 {
                    return Err("가격은 0보다 커야 합니다.".into());
                }
                name = args
                    .get("name")
                    .and_then(|v| v.as_str())
                    .unwrap_or("SnackMachine")
                    .to_string();
                storage.insert("owner".into(), deployer.into());
                storage.insert("price".into(), format!("{:.6} ETH", price));
                storage.insert("stock".into(), stock.to_string());
                storage.insert("totalSold".into(), "0".into());
            }
            "erc20" => {
                let supply = args.get("supply").and_then(|v| v.as_f64()).unwrap_or(1000.0);
                name = args
                    .get("name")
                    .and_then(|v| v.as_str())
                    .unwrap_or("TOKEN")
                    .to_string();
                storage.insert("symbol".into(), name.clone());
                storage.insert("totalSupply".into(), format!("{:.2}", supply));
                storage.insert(format!("balance[{}]", deployer), format!("{:.2}", supply));
            }
            "pricefeed" => {
                name = args
                    .get("name")
                    .and_then(|v| v.as_str())
                    .unwrap_or("ETH/USD Feed")
                    .to_string();
                let default_nodes = vec!["Binance", "Bybit", "Coinbase"];
                let nodes: Vec<String> = args
                    .get("nodes")
                    .and_then(|v| v.as_array())
                    .map(|a| {
                        a.iter()
                            .filter_map(|x| x.as_str().map(String::from))
                            .collect()
                    })
                    .unwrap_or_else(|| default_nodes.iter().map(|s| s.to_string()).collect());
                storage.insert("oracles".into(), nodes.join(", "));
                storage.insert("latestAnswer".into(), "—".into());
                for n in &nodes {
                    storage.insert(format!("report[{}]", n), "—".into());
                }
            }
            "insurance" => {
                let feed = args
                    .get("feed")
                    .and_then(|v| v.as_str())
                    .ok_or("feed 주소가 필요합니다.")?
                    .to_string();
                if self.find(&feed).map(|c| c.kind.clone()) != Some("pricefeed".into()) {
                    return Err("feed 주소가 PriceFeed 컨트랙트가 아닙니다.".into());
                }
                let threshold = args
                    .get("threshold")
                    .and_then(|v| v.as_f64())
                    .unwrap_or(3000.0);
                let payout = args.get("payoutEth").and_then(|v| v.as_f64()).unwrap_or(1.0);
                let premium = args
                    .get("premiumEth")
                    .and_then(|v| v.as_f64())
                    .unwrap_or(0.1);
                if value_wei < eth_to_wei(payout) {
                    return Err(format!(
                        "지급 풀 부족: payout {:.3} ETH 를 배포 시 예치해야 합니다.",
                        payout
                    ));
                }
                name = args
                    .get("name")
                    .and_then(|v| v.as_str())
                    .unwrap_or("PriceProtection")
                    .to_string();
                storage.insert("feed".into(), feed);
                storage.insert("threshold(USD)".into(), format!("{:.0}", threshold));
                storage.insert("payout".into(), format!("{:.6} ETH", payout));
                storage.insert("premium".into(), format!("{:.6} ETH", premium));
                storage.insert("insured".into(), "—".into());
                storage.insert("status".into(), "Open".into());
            }
            "escrow" => {
                let price = args.get("priceEth").and_then(|v| v.as_f64()).unwrap_or(5.0);
                if price <= 0.0 {
                    return Err("매물 가격은 0보다 커야 합니다.".into());
                }
                name = args
                    .get("name")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Property")
                    .to_string();
                let buyer = args
                    .get("buyer")
                    .and_then(|v| v.as_str())
                    .unwrap_or("—")
                    .to_string();
                let inspector = args
                    .get("inspector")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Carol")
                    .to_string();
                // 확인자 수수료: 지정 없으면 매매가의 2% (성공적으로 release 될 때만 지급)
                let fee = args
                    .get("inspectorFeeEth")
                    .and_then(|v| v.as_f64())
                    .unwrap_or(price * 0.02)
                    .max(0.0);
                if fee >= price {
                    return Err("확인자 수수료는 매매가보다 작아야 합니다.".into());
                }
                storage.insert("seller".into(), deployer.into());
                storage.insert("buyer".into(), buyer);
                storage.insert("inspector".into(), inspector);
                storage.insert("price".into(), format!("{:.6} ETH", price));
                storage.insert("inspectorFee".into(), format!("{:.6} ETH", fee));
                storage.insert("state".into(), "Listed".into());
            }
            _ => return Err(format!("알 수 없는 컨트랙트 종류: {}", kind)),
        }

        let c = Contract {
            address: address.clone(),
            kind: kind.into(),
            name: name.clone(),
            deployer: deployer.into(),
            created_nonce: nonce,
            balance_wei: value_wei,
            storage,
        };
        self.logs.push(format!(
            "[DEPLOY] {} ({}) → {} | deployer={} nonce={}",
            name, kind, address, deployer, nonce
        ));
        self.contracts.push(c);
        Ok(address)
    }

    // ---------- 호출 ----------

    pub fn call(
        &mut self,
        address: &str,
        func: &str,
        args: &serde_json::Value,
        caller: &str,
        value_wei: u64,
    ) -> Result<CallOutcome, RevertError> {
        let idx = self.find_idx(address).ok_or(RevertError {
            gas_used: 21_000,
            reason: "해당 주소에 컨트랙트가 없습니다.".into(),
        })?;
        let kind = self.contracts[idx].kind.clone();
        let gas = call_gas(&kind, func);
        let revert = |reason: String| RevertError { gas_used: gas, reason };

        let outcome = match (kind.as_str(), func) {
            ("vending", "buy") => self.vending_buy(idx, caller, value_wei, gas),
            ("vending", "withdraw") => self.vending_withdraw(idx, caller, gas),
            ("erc20", "transfer") => self.erc20_transfer(idx, caller, args, gas),
            ("pricefeed", "report") => self.feed_report(idx, caller, args, gas),
            ("insurance", "buy_policy") => self.ins_buy_policy(idx, caller, value_wei, gas),
            ("insurance", "settle") => self.ins_settle(idx, caller, gas),
            ("escrow", "deposit") => self.escrow_deposit(idx, caller, value_wei, gas),
            ("escrow", "confirm") => self.escrow_confirm(idx, caller, gas),
            ("escrow", "release") => self.escrow_release(idx, caller, gas),
            ("escrow", "refund") => self.escrow_refund(idx, caller, gas),
            _ => Err(format!("함수 {}() 가 없습니다 — 코드는 배포 후 못 바꿉니다.", func)),
        };

        match outcome {
            Ok(o) => {
                // 받은 value 는 컨트랙트 잔액에 (payout 은 각 함수에서 이미 차감)
                self.contracts[idx].balance_wei =
                    self.contracts[idx].balance_wei.saturating_add(value_wei);
                for ev in &o.events {
                    self.events.push(ev.clone());
                }
                self.logs.push(format!(
                    "[CALL] {}.{}() by {} | {}",
                    self.contracts[idx].name, func, caller, o.note
                ));
                Ok(o)
            }
            Err(reason) => {
                self.logs.push(format!(
                    "[REVERT] {}.{}() by {} | {} (gas {} 소모)",
                    self.contracts[idx].name, func, caller, reason, gas
                ));
                Err(revert(reason))
            }
        }
    }

    // ---- vending ----

    fn vending_buy(
        &mut self,
        idx: usize,
        caller: &str,
        value_wei: u64,
        gas: u64,
    ) -> Result<CallOutcome, String> {
        let c = &mut self.contracts[idx];
        let price_wei = parse_eth_slot(c.storage.get("price"))?;
        let stock: u64 = c
            .storage
            .get("stock")
            .and_then(|s| s.parse().ok())
            .unwrap_or(0);
        if stock == 0 {
            return Err("재고 없음 (stock = 0)".into());
        }
        if value_wei < price_wei {
            return Err(format!(
                "지불 부족: price {} 인데 {} 만 보냈습니다.",
                fmt_eth(price_wei),
                fmt_eth(value_wei)
            ));
        }
        let sold: u64 = c
            .storage
            .get("totalSold")
            .and_then(|s| s.parse().ok())
            .unwrap_or(0);
        c.storage.insert("stock".into(), (stock - 1).to_string());
        c.storage.insert("totalSold".into(), (sold + 1).to_string());
        let ev = Event::new(
            c,
            "Purchased",
            "Purchased(address,uint256)",
            vec![
                ("buyer".into(), caller.into()),
                ("paid".into(), fmt_eth(value_wei)),
            ],
        );
        Ok(CallOutcome {
            gas_used: gas,
            note: format!("{} 구매 · 남은 재고 {}", caller, stock - 1),
            events: vec![ev],
            payouts: vec![],
        })
    }

    fn vending_withdraw(
        &mut self,
        idx: usize,
        caller: &str,
        gas: u64,
    ) -> Result<CallOutcome, String> {
        let c = &mut self.contracts[idx];
        let owner = c.storage.get("owner").cloned().unwrap_or_default();
        if caller != owner {
            return Err(format!(
                "권한 없음: owner({})만 withdraw 가능. 코드가 곧 규칙입니다.",
                owner
            ));
        }
        let amount = c.balance_wei;
        if amount == 0 {
            return Err("컨트랙트 잔액이 0 입니다.".into());
        }
        c.balance_wei = 0;
        let ev = Event::new(
            c,
            "Withdrawn",
            "Withdrawn(address,uint256)",
            vec![
                ("owner".into(), caller.into()),
                ("amount".into(), fmt_eth(amount)),
            ],
        );
        Ok(CallOutcome {
            gas_used: gas,
            note: format!("owner 인출 {}", fmt_eth(amount)),
            events: vec![ev],
            payouts: vec![(caller.into(), amount)],
        })
    }

    // ---- erc20 ----

    fn erc20_transfer(
        &mut self,
        idx: usize,
        caller: &str,
        args: &serde_json::Value,
        gas: u64,
    ) -> Result<CallOutcome, String> {
        let to = args
            .get("to")
            .and_then(|v| v.as_str())
            .ok_or("to 가 필요합니다.")?
            .to_string();
        let amount = args
            .get("amount")
            .and_then(|v| v.as_f64())
            .ok_or("amount 가 필요합니다.")?;
        if amount <= 0.0 {
            return Err("amount 는 0보다 커야 합니다.".into());
        }
        let c = &mut self.contracts[idx];
        let from_key = format!("balance[{}]", caller);
        let to_key = format!("balance[{}]", to);
        let from_bal: f64 = c
            .storage
            .get(&from_key)
            .and_then(|s| s.parse().ok())
            .unwrap_or(0.0);
        if from_bal + 1e-9 < amount {
            return Err(format!(
                "{} 잔액 부족: {:.2} / 필요 {:.2}",
                c.name, from_bal, amount
            ));
        }
        let to_bal: f64 = c
            .storage
            .get(&to_key)
            .and_then(|s| s.parse().ok())
            .unwrap_or(0.0);
        c.storage.insert(from_key, format!("{:.2}", from_bal - amount));
        c.storage.insert(to_key, format!("{:.2}", to_bal + amount));
        let ev = Event::new(
            c,
            "Transfer",
            "Transfer(address,address,uint256)",
            vec![
                ("from".into(), caller.into()),
                ("to".into(), to.clone()),
                ("value".into(), format!("{:.2} {}", amount, c.name)),
            ],
        );
        Ok(CallOutcome {
            gas_used: gas,
            note: format!("{} → {}: {:.2} {}", caller, to, amount, c.name),
            events: vec![ev],
            payouts: vec![],
        })
    }

    // ---- pricefeed ----

    fn feed_report(
        &mut self,
        idx: usize,
        caller: &str,
        args: &serde_json::Value,
        gas: u64,
    ) -> Result<CallOutcome, String> {
        let price = args
            .get("price")
            .and_then(|v| v.as_f64())
            .ok_or("price 가 필요합니다.")?;
        let c = &mut self.contracts[idx];
        let oracles = c.storage.get("oracles").cloned().unwrap_or_default();
        let allowed: Vec<&str> = oracles.split(", ").collect();
        if !allowed.contains(&caller) {
            return Err(format!(
                "권한 없음: 등록된 oracle({})만 report 가능",
                oracles
            ));
        }
        c.storage
            .insert(format!("report[{}]", caller), format!("{:.2}", price));
        // median 갱신
        let mut vals: Vec<f64> = allowed
            .iter()
            .filter_map(|n| {
                c.storage
                    .get(&format!("report[{}]", n))
                    .and_then(|s| s.parse().ok())
            })
            .collect();
        vals.sort_by(|a, b| a.partial_cmp(b).unwrap());
        let median = if vals.is_empty() {
            None
        } else {
            Some(vals[vals.len() / 2])
        };
        if let Some(m) = median {
            c.storage.insert("latestAnswer".into(), format!("{:.2}", m));
        }
        let ev = Event::new(
            c,
            "AnswerUpdated",
            "AnswerUpdated(int256,uint256,uint256)",
            vec![
                ("reporter".into(), caller.into()),
                ("report".into(), format!("{:.2}", price)),
                (
                    "median".into(),
                    median.map(|m| format!("{:.2}", m)).unwrap_or("—".into()),
                ),
            ],
        );
        Ok(CallOutcome {
            gas_used: gas,
            note: format!(
                "{} 보고 {:.2} → median {}",
                caller,
                price,
                median.map(|m| format!("{:.2}", m)).unwrap_or("—".into())
            ),
            events: vec![ev],
            payouts: vec![],
        })
    }

    fn feed_median(&self, address: &str) -> Option<f64> {
        let c = self.find(address)?;
        c.storage
            .get("latestAnswer")
            .and_then(|s| s.parse::<f64>().ok())
    }

    // ---- insurance ----

    fn ins_buy_policy(
        &mut self,
        idx: usize,
        caller: &str,
        value_wei: u64,
        gas: u64,
    ) -> Result<CallOutcome, String> {
        let c = &mut self.contracts[idx];
        let status = c.storage.get("status").cloned().unwrap_or_default();
        if status != "Open" {
            return Err(format!("가입 불가: status = {}", status));
        }
        let premium_wei = parse_eth_slot(c.storage.get("premium"))?;
        if value_wei < premium_wei {
            return Err(format!(
                "프리미엄 부족: {} 필요, {} 받음",
                fmt_eth(premium_wei),
                fmt_eth(value_wei)
            ));
        }
        c.storage.insert("insured".into(), caller.into());
        c.storage.insert("status".into(), "Active".into());
        let ev = Event::new(
            c,
            "PolicyBought",
            "PolicyBought(address,uint256)",
            vec![
                ("insured".into(), caller.into()),
                ("premium".into(), fmt_eth(value_wei)),
            ],
        );
        Ok(CallOutcome {
            gas_used: gas,
            note: format!("{} 보험 가입 (premium {})", caller, fmt_eth(value_wei)),
            events: vec![ev],
            payouts: vec![],
        })
    }

    fn ins_settle(&mut self, idx: usize, caller: &str, gas: u64) -> Result<CallOutcome, String> {
        let (feed_addr, threshold, insured, status, payout_wei) = {
            let c = &self.contracts[idx];
            (
                c.storage.get("feed").cloned().unwrap_or_default(),
                c.storage
                    .get("threshold(USD)")
                    .and_then(|s| s.parse::<f64>().ok())
                    .unwrap_or(0.0),
                c.storage.get("insured").cloned().unwrap_or("—".into()),
                c.storage.get("status").cloned().unwrap_or_default(),
                parse_eth_slot(c.storage.get("payout"))?,
            )
        };
        if status != "Active" {
            return Err(format!("정산 불가: status = {} (가입자 필요)", status));
        }
        let median = self
            .feed_median(&feed_addr)
            .ok_or("feed 에 아직 답이 없습니다 — oracle report 먼저.")?;

        let c = &mut self.contracts[idx];
        if median < threshold {
            if c.balance_wei < payout_wei {
                return Err("지급 풀 부족".into());
            }
            c.balance_wei -= payout_wei;
            c.storage.insert("status".into(), "Paid".into());
            let ev = Event::new(
                c,
                "PayoutSent",
                "PayoutSent(address,uint256,int256)",
                vec![
                    ("insured".into(), insured.clone()),
                    ("payout".into(), fmt_eth(payout_wei)),
                    ("median".into(), format!("{:.2}", median)),
                ],
            );
            Ok(CallOutcome {
                gas_used: gas,
                note: format!(
                    "median {:.2} < threshold {:.0} → {} 에게 {} 지급",
                    median,
                    threshold,
                    insured,
                    fmt_eth(payout_wei)
                ),
                events: vec![ev],
                payouts: vec![(insured, payout_wei)],
            })
        } else {
            c.storage.insert("status".into(), "Expired".into());
            let ev = Event::new(
                c,
                "Settled",
                "Settled(int256,int256,bool)",
                vec![
                    ("median".into(), format!("{:.2}", median)),
                    ("threshold".into(), format!("{:.0}", threshold)),
                    ("paid".into(), "false".into()),
                ],
            );
            Ok(CallOutcome {
                gas_used: gas,
                note: format!(
                    "median {:.2} ≥ threshold {:.0} → 지급 조건 미충족 (만료). {} 가 호출",
                    median, threshold, caller
                ),
                events: vec![ev],
                payouts: vec![],
            })
        }
    }

    // ---- escrow (부동산 매매) ----

    fn escrow_deposit(
        &mut self,
        idx: usize,
        caller: &str,
        value_wei: u64,
        gas: u64,
    ) -> Result<CallOutcome, String> {
        let c = &mut self.contracts[idx];
        let state = c.storage.get("state").cloned().unwrap_or_default();
        if state != "Listed" {
            return Err(format!(
                "예치 불가: 이미 진행된 거래입니다 (state = {}).",
                state
            ));
        }
        let price_wei = parse_eth_slot(c.storage.get("price"))?;
        let designated = c.storage.get("buyer").cloned().unwrap_or("—".into());
        if designated != "—" && designated != caller {
            return Err(format!(
                "권한 없음: 지정 매수자({})만 예치할 수 있습니다.",
                designated
            ));
        }
        if value_wei < price_wei {
            return Err(format!(
                "대금 부족: 매물가 {} 인데 {} 만 보냈습니다.",
                fmt_eth(price_wei),
                fmt_eth(value_wei)
            ));
        }
        if value_wei > price_wei {
            return Err(format!(
                "대금 초과: 매물가 {} 만큼 정확히 보내세요 ({} 보냄).",
                fmt_eth(price_wei),
                fmt_eth(value_wei)
            ));
        }
        c.storage.insert("buyer".into(), caller.into());
        c.storage.insert("state".into(), "Funded".into());
        let ev = Event::new(
            c,
            "Deposited",
            "Deposited(address,uint256)",
            vec![
                ("buyer".into(), caller.into()),
                ("amount".into(), fmt_eth(value_wei)),
            ],
        );
        Ok(CallOutcome {
            gas_used: gas,
            note: format!("{} 대금 {} 예치 (컨트랙트에 잠김)", caller, fmt_eth(value_wei)),
            events: vec![ev],
            payouts: vec![],
        })
    }

    fn escrow_confirm(&mut self, idx: usize, caller: &str, gas: u64) -> Result<CallOutcome, String> {
        let c = &mut self.contracts[idx];
        let state = c.storage.get("state").cloned().unwrap_or_default();
        if state != "Funded" {
            return Err(format!(
                "확인 불가: 대금 예치(Funded) 상태여야 합니다 (state = {}).",
                state
            ));
        }
        let inspector = c.storage.get("inspector").cloned().unwrap_or("—".into());
        if inspector != caller {
            return Err(format!(
                "권한 없음: 지정 확인자({})만 등기·하자 확인을 할 수 있습니다.",
                inspector
            ));
        }
        c.storage.insert("state".into(), "Confirmed".into());
        let ev = Event::new(
            c,
            "Confirmed",
            "Confirmed(address)",
            vec![("inspector".into(), caller.into())],
        );
        Ok(CallOutcome {
            gas_used: gas,
            note: format!("{} 등기·하자 확인 완료", caller),
            events: vec![ev],
            payouts: vec![],
        })
    }

    fn escrow_release(&mut self, idx: usize, caller: &str, gas: u64) -> Result<CallOutcome, String> {
        let c = &mut self.contracts[idx];
        let state = c.storage.get("state").cloned().unwrap_or_default();
        if state != "Confirmed" {
            return Err(format!(
                "잔금 지급 불가: 확인(Confirmed) 상태여야 합니다 (state = {}).",
                state
            ));
        }
        let seller = c.storage.get("seller").cloned().unwrap_or_default();
        let inspector = c.storage.get("inspector").cloned().unwrap_or("—".into());
        let price_wei = parse_eth_slot(c.storage.get("price"))?;
        // 확인자 수수료를 잠긴 금액에서 떼어 확인자에게, 나머지는 매도자에게
        let fee_wei = parse_eth_slot(c.storage.get("inspectorFee"))
            .unwrap_or(0)
            .min(price_wei);
        let seller_wei = price_wei - fee_wei;
        if c.balance_wei < price_wei {
            return Err("컨트랙트 잔액 부족".into());
        }
        c.balance_wei -= price_wei;
        c.storage.insert("state".into(), "Released".into());
        let ev = Event::new(
            c,
            "Released",
            "Released(address,uint256,address,uint256)",
            vec![
                ("seller".into(), seller.clone()),
                ("amount".into(), fmt_eth(seller_wei)),
                ("inspector".into(), inspector.clone()),
                ("fee".into(), fmt_eth(fee_wei)),
            ],
        );
        let mut payouts = vec![(seller.clone(), seller_wei)];
        if fee_wei > 0 {
            payouts.push((inspector.clone(), fee_wei));
        }
        Ok(CallOutcome {
            gas_used: gas,
            note: format!(
                "잔금 {} → 매도자 {} · 수수료 {} → 확인자 {} 지급 · 거래 완료 ({} 가 호출)",
                fmt_eth(seller_wei),
                seller,
                fmt_eth(fee_wei),
                inspector,
                caller
            ),
            events: vec![ev],
            payouts,
        })
    }

    fn escrow_refund(&mut self, idx: usize, caller: &str, gas: u64) -> Result<CallOutcome, String> {
        let c = &mut self.contracts[idx];
        let state = c.storage.get("state").cloned().unwrap_or_default();
        let seller = c.storage.get("seller").cloned().unwrap_or_default();
        let buyer = c.storage.get("buyer").cloned().unwrap_or("—".into());
        if caller != seller && caller != buyer {
            return Err(format!(
                "권한 없음: 매도자({})나 매수자({})만 파기할 수 있습니다.",
                seller, buyer
            ));
        }
        match state.as_str() {
            "Listed" => {
                // 예치 전 — 지급할 것 없음, 그냥 취소
                c.storage.insert("state".into(), "Refunded".into());
                let ev = Event::new(
                    c,
                    "Refunded",
                    "Refunded(address,uint256)",
                    vec![
                        ("buyer".into(), buyer.clone()),
                        ("amount".into(), fmt_eth(0)),
                    ],
                );
                Ok(CallOutcome {
                    gas_used: gas,
                    note: format!("예치 전 취소 ({} 가 호출)", caller),
                    events: vec![ev],
                    payouts: vec![],
                })
            }
            "Funded" => {
                let price_wei = parse_eth_slot(c.storage.get("price"))?;
                if c.balance_wei < price_wei {
                    return Err("컨트랙트 잔액 부족".into());
                }
                c.balance_wei -= price_wei;
                c.storage.insert("state".into(), "Refunded".into());
                let ev = Event::new(
                    c,
                    "Refunded",
                    "Refunded(address,uint256)",
                    vec![
                        ("buyer".into(), buyer.clone()),
                        ("amount".into(), fmt_eth(price_wei)),
                    ],
                );
                Ok(CallOutcome {
                    gas_used: gas,
                    note: format!(
                        "대금 {} → 매수자 {} 환불 · 거래 파기 ({} 가 호출)",
                        fmt_eth(price_wei),
                        buyer,
                        caller
                    ),
                    events: vec![ev],
                    payouts: vec![(buyer, price_wei)],
                })
            }
            other => Err(format!(
                "파기 불가: 이미 종료됐거나 확인된 거래입니다 (state = {}).",
                other
            )),
        }
    }
}

/// "0.500000 ETH" 형태 슬롯 → wei
fn parse_eth_slot(s: Option<&String>) -> Result<u64, String> {
    let s = s.ok_or("스토리지 슬롯 없음")?;
    let num = s.trim_end_matches(" ETH");
    num.parse::<f64>()
        .map(eth_to_wei)
        .map_err(|_| format!("슬롯 파싱 실패: {}", s))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn reg_with_vending() -> (ContractRegistry, String) {
        let mut reg = ContractRegistry::new();
        let args = serde_json::json!({ "priceEth": 0.5, "stock": 2 });
        let addr = reg
            .deploy("vending", "Alice", "0xaaaa", 0, &args, 0)
            .unwrap();
        (reg, addr)
    }

    #[test]
    fn vending_buy_and_withdraw() {
        let (mut reg, addr) = reg_with_vending();
        let half = UNIT_PER_ETH / 2;
        let o = reg
            .call(&addr, "buy", &serde_json::json!({}), "Bob", half)
            .unwrap();
        assert_eq!(o.events[0].name, "Purchased");
        assert_eq!(reg.find(&addr).unwrap().balance_wei, half);
        // non-owner withdraw → revert
        assert!(reg
            .call(&addr, "withdraw", &serde_json::json!({}), "Bob", 0)
            .is_err());
        let o2 = reg
            .call(&addr, "withdraw", &serde_json::json!({}), "Alice", 0)
            .unwrap();
        assert_eq!(o2.payouts[0].0, "Alice");
    }

    #[test]
    fn erc20_topic0_is_real() {
        let mut reg = ContractRegistry::new();
        let args = serde_json::json!({ "name": "SAND", "supply": 100.0 });
        let addr = reg.deploy("erc20", "Alice", "0xaaaa", 1, &args, 0).unwrap();
        let o = reg
            .call(
                &addr,
                "transfer",
                &serde_json::json!({ "to": "Bob", "amount": 10.0 }),
                "Alice",
                0,
            )
            .unwrap();
        // 실제 ERC-20 Transfer topic0
        assert_eq!(
            o.events[0].topic0,
            "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
        );
    }

    #[test]
    fn feed_median_and_insurance() {
        let mut reg = ContractRegistry::new();
        let feed = reg
            .deploy("pricefeed", "Alice", "0xaaaa", 0, &serde_json::json!({}), 0)
            .unwrap();
        for (n, p) in [("Binance", 3100.0), ("Bybit", 2900.0), ("Coinbase", 2950.0)] {
            reg.call(&feed, "report", &serde_json::json!({ "price": p }), n, 0)
                .unwrap();
        }
        assert_eq!(reg.feed_median(&feed), Some(2950.0));
        // 비 oracle 은 거절
        assert!(reg
            .call(&feed, "report", &serde_json::json!({ "price": 1.0 }), "Mallory", 0)
            .is_err());

        let ins = reg
            .deploy(
                "insurance",
                "Alice",
                "0xaaaa",
                1,
                &serde_json::json!({ "feed": feed, "threshold": 3000.0, "payoutEth": 1.0, "premiumEth": 0.1 }),
                UNIT_PER_ETH, // 1 ETH 지급 풀
            )
            .unwrap();
        reg.call(&ins, "buy_policy", &serde_json::json!({}), "Bob", UNIT_PER_ETH / 10)
            .unwrap();
        let o = reg.call(&ins, "settle", &serde_json::json!({}), "Carol", 0).unwrap();
        assert_eq!(o.payouts[0].0, "Bob"); // median 2950 < 3000 → 지급
    }

    #[test]
    fn escrow_happy_path() {
        let mut reg = ContractRegistry::new();
        let price = 5.0 * UNIT_PER_ETH as f64;
        let price_wei = price as u64;
        let addr = reg
            .deploy(
                "escrow",
                "Bob", // 매도자
                "0xbbbb",
                0,
                &serde_json::json!({ "priceEth": 5.0, "name": "Apt-101", "buyer": "Alice", "inspector": "Carol", "inspectorFeeEth": 0.1 }),
                0,
            )
            .unwrap();
        // confirm before deposit → revert
        assert!(reg.call(&addr, "confirm", &serde_json::json!({}), "Carol", 0).is_err());
        // wrong buyer → revert
        assert!(reg.call(&addr, "deposit", &serde_json::json!({}), "Mallory", price_wei).is_err());
        // wrong amount → revert
        assert!(reg.call(&addr, "deposit", &serde_json::json!({}), "Alice", price_wei / 2).is_err());
        // correct deposit
        let o = reg.call(&addr, "deposit", &serde_json::json!({}), "Alice", price_wei).unwrap();
        assert_eq!(o.events[0].name, "Deposited");
        assert_eq!(reg.find(&addr).unwrap().balance_wei, price_wei);
        assert_eq!(reg.find(&addr).unwrap().storage.get("state").unwrap(), "Funded");
        // release before confirm → revert
        assert!(reg.call(&addr, "release", &serde_json::json!({}), "Alice", 0).is_err());
        // non-inspector confirm → revert
        assert!(reg.call(&addr, "confirm", &serde_json::json!({}), "Alice", 0).is_err());
        // inspector confirm
        reg.call(&addr, "confirm", &serde_json::json!({}), "Carol", 0).unwrap();
        assert_eq!(reg.find(&addr).unwrap().storage.get("state").unwrap(), "Confirmed");
        // release → seller + inspector paid (수수료 0.1 ETH 는 확인자 몫)
        let fee_wei = eth_to_wei(0.1);
        let seller_wei = price_wei - fee_wei;
        let o = reg.call(&addr, "release", &serde_json::json!({}), "Alice", 0).unwrap();
        assert_eq!(o.payouts[0], ("Bob".to_string(), seller_wei));
        assert_eq!(o.payouts[1], ("Carol".to_string(), fee_wei));
        assert_eq!(reg.find(&addr).unwrap().balance_wei, 0);
        assert_eq!(reg.find(&addr).unwrap().storage.get("state").unwrap(), "Released");
    }

    #[test]
    fn escrow_refund_after_funding() {
        let mut reg = ContractRegistry::new();
        let price_wei = 3 * UNIT_PER_ETH;
        let addr = reg
            .deploy(
                "escrow",
                "Bob",
                "0xbbbb",
                0,
                &serde_json::json!({ "priceEth": 3.0, "buyer": "Alice", "inspector": "Carol" }),
                0,
            )
            .unwrap();
        reg.call(&addr, "deposit", &serde_json::json!({}), "Alice", price_wei).unwrap();
        // stranger cannot refund
        assert!(reg.call(&addr, "refund", &serde_json::json!({}), "Mallory", 0).is_err());
        let o = reg.call(&addr, "refund", &serde_json::json!({}), "Alice", 0).unwrap();
        assert_eq!(o.payouts[0], ("Alice".to_string(), price_wei));
        assert_eq!(reg.find(&addr).unwrap().storage.get("state").unwrap(), "Refunded");
    }
}
