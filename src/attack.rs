// ============================================================
// attack.rs — 51% 이중지불 공격 시뮬레이터 (교육용)
// ============================================================
// "가장 긴 체인이 이긴다"는 규칙을 악용하면 어떤 일이 벌어질까?
//
// 공격자는 같은 코인을 두 번 쓴다:
//   tx_결제 = 공격자 → 상점 : 10 BTC   (정직한 공개 체인에 담김)
//   tx_사기 = 공격자 → 공격자 : 10 BTC  (공격자 비밀 체인에 담김, 같은 출처 코인)
//
// 이 둘은 같은 코인을 쓰므로 한 체인 안엔 공존할 수 없다.
// 서로 다른 갈래에만 존재하고, 어느 갈래가 "더 길어지느냐"로 승부가 난다.
//
// 시나리오:
//   1) 공격자가 상점에 결제 → 공개 체인에 담김 → 상점은 컨펌 보고 물건 배송 📦
//   2) 공격자는 몰래(방송 안 하고) 결제 직전에서 갈라져 나온 비밀 체인을 캔다.
//      그 비밀 체인엔 결제 대신 "자기에게 되돌리는" 거래가 들어간다.
//   3) 비밀 체인이 공개 체인보다 길어지는 순간 💥 공개(reveal).
//   4) 정직한 노드들은 "더 긴 체인"을 채택(reorg) → 결제 거래가 사라진다.
//      상점은 물건도 잃고 돈도 못 받는다.
//
// 공격이 성공하려면 공격자가 정직한 네트워크보다 블록을 더 빨리 캐야 한다
// (= 51% 해시파워). 그리고 상점이 컨펌을 많이 기다릴수록 공격은 어려워진다.

use crate::block::Block;
use crate::network::mine_block;
use crate::transaction::Transaction;

const ATTACKER: &str = "Attacker";
const MERCHANT: &str = "Merchant";
const HONEST: &str = "Honest";
const AMOUNT: f64 = 10.0;

pub struct DoubleSpend {
    difficulty: usize,
    reward: f64,
    required_conf: usize,

    // 정직한(공개) 체인. [0]은 제네시스. 네트워크가 인정하는 진짜 체인.
    public_chain: Vec<Block>,
    // 공격자의 비밀 체인. 공개(reveal) 전까지 자기만 안다.
    attacker_chain: Vec<Block>,

    // 갈라진 지점(공통 prefix 길이) = 결제 블록 직전까지의 블록 수.
    fork_len: usize,
    // 결제 tx가 담긴 공개 체인의 인덱스.
    payment_height: usize,

    started: bool,   // 결제가 시작(공개 체인에 결제 블록 추가)됐나
    shipped: bool,   // 상점이 물건을 내줬나 (컨펌 충족)
    revealed: bool,  // 비밀 체인이 공개됐나
    attack_won: bool, // 공개 시점에 공격자 체인이 실제로 채택됐나

    logs: Vec<String>,
}

impl DoubleSpend {
    pub fn new(difficulty: usize, required_conf: usize) -> Self {
        let diff = difficulty.clamp(1, 5);
        let genesis = mine_block(0, vec![], "0".to_string(), diff);
        let mut ds = DoubleSpend {
            difficulty: diff,
            reward: 50.0,
            required_conf: required_conf.clamp(1, 6),
            public_chain: vec![genesis.clone()],
            attacker_chain: vec![genesis],
            fork_len: 0,
            payment_height: 0,
            started: false,
            shipped: false,
            revealed: false,
            attack_won: false,
            logs: Vec::new(),
        };
        ds.log(format!(
            "[준비] 제네시스 생성. 상점은 결제 후 컨펌 {}개를 기다렸다 물건을 배송합니다.",
            ds.required_conf
        ));
        ds
    }

    fn log(&mut self, m: String) {
        self.logs.push(m);
    }

    pub fn drain_logs(&mut self) -> Vec<String> {
        std::mem::take(&mut self.logs)
    }

    // ① 결제 방송: 공격자→상점 거래를 정직한 공개 체인에 담아 블록을 만든다.
    //    동시에, 공격자의 비밀 체인은 "결제 직전"에서 갈라져 나온다.
    pub fn start_payment(&mut self) {
        if self.started {
            self.log("[무시] 이미 결제가 시작됐습니다. 초기화 후 다시 시도하세요.".into());
            return;
        }
        if self.revealed {
            return;
        }

        // 갈라지는 지점 = 지금까지의 공개 체인(결제 블록 직전).
        self.fork_len = self.public_chain.len();

        // 공개 체인에 결제 블록 추가: [코인베이스(정직한 채굴자), 공격자→상점]
        let prev = self.public_chain.last().unwrap().hash.clone();
        let id = self.public_chain.len() as u64;
        let txs = vec![
            Transaction::coinbase(HONEST, self.reward),
            Transaction::new(ATTACKER, MERCHANT, AMOUNT),
        ];
        let block = mine_block(id, txs, prev, self.difficulty);
        self.public_chain.push(block);
        self.payment_height = self.fork_len; // 결제 블록의 인덱스

        // 공격자 비밀 체인은 결제 직전까지의 prefix만 복사(= 결제 거래를 뺀 역사).
        self.attacker_chain = self.public_chain[..self.fork_len].to_vec();

        self.started = true;
        self.log(format!(
            "[① 결제] 공격자 → 상점 {AMOUNT} BTC 거래가 공개 체인 블록 #{id}에 담김 (컨펌 1개)."
        ));
        self.log("[공격 준비] 공격자는 '결제 직전' 지점에서 몰래 다른 체인을 파기 시작합니다 😈".into());
        self.check_shipping();
    }

    // 정직한 네트워크가 공개 체인에 블록 하나를 더 쌓는다(코인베이스만).
    pub fn honest_mine(&mut self) {
        if !self.started {
            self.log("[안내] 먼저 '① 결제 방송'을 눌러 주세요.".into());
            return;
        }
        if self.revealed {
            return;
        }
        let prev = self.public_chain.last().unwrap().hash.clone();
        let id = self.public_chain.len() as u64;
        let block = mine_block(id, vec![Transaction::coinbase(HONEST, self.reward)], prev, self.difficulty);
        self.public_chain.push(block);
        self.log(format!(
            "[정직한 채굴] 공개 체인에 블록 #{id} 추가 → 결제 컨펌 {}개",
            self.confirmations()
        ));
        self.check_shipping();
    }

    // 공격자가 비밀 체인에 블록을 하나 캔다(방송 안 함).
    // 갈라진 뒤 첫 블록엔 "공격자 → 공격자"(같은 코인 되돌리기)가 들어간다.
    pub fn attacker_mine(&mut self) {
        if !self.started {
            self.log("[안내] 먼저 '① 결제 방송'을 눌러 주세요.".into());
            return;
        }
        if self.revealed {
            return;
        }
        let prev = self.attacker_chain.last().unwrap().hash.clone();
        let id = self.attacker_chain.len() as u64;

        // 갈라진 직후 첫 블록에만 사기 거래를 넣는다.
        let is_first = self.attacker_chain.len() == self.fork_len;
        let txs = if is_first {
            vec![
                Transaction::coinbase(ATTACKER, self.reward),
                Transaction::new(ATTACKER, ATTACKER, AMOUNT), // 같은 코인을 자기에게
            ]
        } else {
            vec![Transaction::coinbase(ATTACKER, self.reward)]
        };
        let block = mine_block(id, txs, prev, self.difficulty);
        self.attacker_chain.push(block);

        if is_first {
            self.log(format!(
                "[공격자 채굴 😈] 비밀 블록 #{id}: '공격자 → 공격자 {AMOUNT} BTC'로 결제를 무효화하는 역사 시작"
            ));
        } else {
            self.log(format!("[공격자 채굴 😈] 비밀 블록 #{id} (아직 아무도 모름)"));
        }
        self.log(format!(
            "   현재 길이 — 공개 {} vs 공격자 {}",
            self.public_chain.len() - 1,
            self.attacker_chain.len() - 1
        ));
    }

    // 💥 비밀 체인 공개: 더 길면 정직한 노드들이 채택(reorg)한다.
    pub fn reveal(&mut self) {
        if !self.started {
            self.log("[안내] 먼저 결제부터 시작하세요.".into());
            return;
        }
        if self.revealed {
            self.log("[무시] 이미 공개했습니다. 초기화 후 다시 해보세요.".into());
            return;
        }
        self.revealed = true;

        if self.attacker_chain.len() > self.public_chain.len() {
            // 더 긴 체인 → 정직한 노드들이 갈아탄다. 결제가 사라진다.
            self.attack_won = true;
            self.public_chain = self.attacker_chain.clone();
            self.log(format!(
                "[💥 공개] 공격자 체인(길이 {})이 공개 체인(길이 {})보다 김 → 네트워크가 재구성(reorg)!",
                self.attacker_chain.len() - 1,
                self.public_chain.len() - 1
            ));
            self.log("[재구성] 공개 체인의 '공격자 → 상점' 결제가 사라지고, '공격자 → 공격자'로 대체됨 ⚠️".into());
            if self.shipped {
                self.log("[결과] 😈 공격 성공! 상점은 이미 물건을 배송했는데 돈은 공격자에게 돌아갔습니다.".into());
            } else {
                self.log("[결과] 결제는 되돌려졌지만, 상점이 아직 물건을 안 줘서 실질 피해는 없습니다.".into());
            }
        } else {
            // 공격자가 못 따라잡음 → 공개 체인 유지. 결제 확정.
            self.attack_won = false;
            self.log(format!(
                "[💥 공개] 공격자 체인(길이 {})이 공개 체인(길이 {}) 이하 → 네트워크가 무시!",
                self.attacker_chain.len() - 1,
                self.public_chain.len() - 1
            ));
            self.log("[결과] ✅ 공격 실패! 정직한 체인이 더 길어 결제가 그대로 확정됩니다.".into());
        }
    }

    // 상점이 컨펌을 충분히 봐서 물건을 배송하는지 확인.
    fn check_shipping(&mut self) {
        if !self.shipped && self.started && self.confirmations() >= self.required_conf {
            self.shipped = true;
            self.log(format!(
                "[상점 📦] 결제 컨펌 {}개 확인 → 물건 배송 완료! (현실에선 되돌릴 수 없음)",
                self.confirmations()
            ));
        }
    }

    // 결제 블록 위에 쌓인 블록 수(결제 블록 포함) = 컨펌 수.
    fn confirmations(&self) -> usize {
        if !self.started || self.attack_won {
            return 0;
        }
        self.public_chain.len().saturating_sub(self.payment_height)
    }

    // 어떤 체인에서 상점의 잔액(결제 반영 여부)을 계산.
    fn merchant_balance(chain: &[Block]) -> f64 {
        let mut bal = 0.0;
        for b in chain {
            for t in &b.transactions {
                if t.to == MERCHANT {
                    bal += t.amount;
                }
                if t.from == MERCHANT {
                    bal -= t.amount;
                }
            }
        }
        bal
    }

    // ---- 화면 렌더용 접근자 ----
    pub fn difficulty(&self) -> usize {
        self.difficulty
    }
    pub fn required_conf(&self) -> usize {
        self.required_conf
    }
    pub fn public_chain(&self) -> &[Block] {
        &self.public_chain
    }
    pub fn attacker_chain(&self) -> &[Block] {
        &self.attacker_chain
    }
    pub fn fork_len(&self) -> usize {
        self.fork_len
    }
    pub fn started(&self) -> bool {
        self.started
    }
    pub fn shipped(&self) -> bool {
        self.shipped
    }
    pub fn revealed(&self) -> bool {
        self.revealed
    }
    pub fn attack_won(&self) -> bool {
        self.attack_won
    }
    pub fn confirmations_pub(&self) -> usize {
        self.confirmations()
    }
    pub fn merchant_balance_pub(&self) -> f64 {
        Self::merchant_balance(&self.public_chain)
    }
}
