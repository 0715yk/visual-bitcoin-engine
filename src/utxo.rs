// ============================================================
// utxo.rs — 비트코인의 진짜 거래 모델: UTXO + 디지털 서명(secp256k1)
// ============================================================
// 계좌식(blockchain.rs)은 "잔액"을 직접 기억했다. 진짜 비트코인은 다르다:
//
//   1) 잔액 대신 "안 쓴 거래 출력(UTXO)" 조각들만 존재한다.       (지갑 속 동전들)
//   2) 각 UTXO는 특정 "주소"(공개키에서 유도)에 잠겨 있다.
//   3) 그 동전을 쓰려면, 그 주소의 "개인키로 서명"해서
//      "내가 주인이다"를 증명해야 한다.  ← 이게 진짜 보안의 핵심
//
// PoW(채굴)가 '블록'을 지킨다면, 디지털 서명은 '개별 거래'를 지킨다.
// 남의 동전을 가리키는 거래를 만들어도, 그 사람의 개인키가 없으면
// 유효한 서명을 만들 수 없어 검증에서 거부된다.

use std::collections::HashMap;
use std::fmt::Write as _;

use k256::ecdsa::signature::{Signer, Verifier};
use k256::ecdsa::{Signature, SigningKey, VerifyingKey};

use crate::block::sha256_hex;

// ---------- 작은 16진수 도우미 ----------
fn to_hex(bytes: &[u8]) -> String {
    let mut s = String::new();
    for b in bytes {
        let _ = write!(s, "{b:02x}");
    }
    s
}
fn from_hex(s: &str) -> Vec<u8> {
    (0..s.len())
        .step_by(2)
        .filter_map(|i| s.get(i..i + 2))
        .filter_map(|h| u8::from_str_radix(h, 16).ok())
        .collect()
}

// ============================================================
// 지갑 — 개인키/공개키/주소
// ============================================================
// 개인키(SigningKey)는 비밀. 공개키(VerifyingKey)는 공개.
// 주소는 공개키를 해시해서 만든다(실제 비트코인도 공개키 해시가 주소의 핵심).
struct Wallet {
    sk: SigningKey,
    pubkey_hex: String,
    address: String,
}

// 무작위 개인키 1개 생성 (32바이트 난수가 유효한 스칼라가 될 때까지)
fn random_signing_key() -> SigningKey {
    loop {
        let mut bytes = [0u8; 32];
        getrandom::getrandom(&mut bytes).expect("난수 생성 실패");
        if let Ok(sk) = SigningKey::from_slice(&bytes) {
            return sk;
        }
    }
}

fn pubkey_hex_of(vk: &VerifyingKey) -> String {
    // 압축 공개키(33바이트, 02/03 접두사)를 16진수로
    to_hex(vk.to_encoded_point(true).as_bytes())
}

// 주소 = "1" + sha256(공개키)의 앞 20자리 (교육용 단순화. 실제는 RIPEMD160(SHA256)+Base58Check)
fn address_from_pubkey_hex(pubkey_hex: &str) -> String {
    format!("1{}", &sha256_hex(pubkey_hex)[..20])
}

impl Wallet {
    fn generate() -> Self {
        let sk = random_signing_key();
        let pubkey_hex = pubkey_hex_of(sk.verifying_key());
        let address = address_from_pubkey_hex(&pubkey_hex);
        Wallet {
            sk,
            pubkey_hex,
            address,
        }
    }
}

// ============================================================
// UTXO / 입력 / 출력
// ============================================================
#[derive(Clone, serde::Serialize)]
pub struct Utxo {
    pub txid: String,
    pub vout: u32,
    pub address: String, // 이 동전이 잠긴 주소
    pub amount: f64,
}
impl Utxo {
    pub fn key(txid: &str, vout: u32) -> String {
        format!("{txid}:{vout}")
    }
}

#[derive(Clone, serde::Serialize)]
pub struct Output {
    pub address: String,
    pub amount: f64,
}

#[derive(Clone, serde::Serialize)]
pub struct Input {
    pub txid: String,
    pub vout: u32,
    // 이 입력을 풀기 위한 서명과 공개키 (Phase 2에서 추가)
    pub signature: String,
    pub pubkey: String,
}

// 송금 한 건의 전체 내역 (화면 시각화용)
pub struct SendResult {
    pub ok: bool,
    pub error: Option<String>,
    pub txid: String,
    pub spent: Vec<Utxo>,
    pub created: Vec<(Utxo, bool)>, // (UTXO, 거스름돈 여부)
    pub fee: f64,
    pub selected_sum: f64,

    // --- 서명/검증 정보 ---
    pub sighash: String,       // 서명 대상 메시지의 해시
    pub signature: String,     // 만들어진 서명(hex)
    pub pubkey: String,        // 서명자의 공개키(hex)
    pub signer_label: String,  // 서명한 사람(라벨)
    pub signer_address: String, // 서명자의 주소
    pub lock_address: String,  // 소비하려는 UTXO가 잠긴 주소
    pub verified: bool,        // 서명 검증 통과 여부
}

impl SendResult {
    fn fail(msg: &str) -> Self {
        SendResult {
            ok: false,
            error: Some(msg.to_string()),
            txid: String::new(),
            spent: vec![],
            created: vec![],
            fee: 0.0,
            selected_sum: 0.0,
            sighash: String::new(),
            signature: String::new(),
            pubkey: String::new(),
            signer_label: String::new(),
            signer_address: String::new(),
            lock_address: String::new(),
            verified: false,
        }
    }
}

// ============================================================
// UtxoEngine
// ============================================================
pub struct UtxoEngine {
    utxos: HashMap<String, Utxo>,
    wallets: HashMap<String, Wallet>, // 라벨(이름) → 지갑
    counter: u64,
    logs: Vec<String>,
}

impl UtxoEngine {
    pub fn new() -> Self {
        UtxoEngine {
            utxos: HashMap::new(),
            wallets: HashMap::new(),
            counter: 0,
            logs: Vec::new(),
        }
    }

    fn log(&mut self, msg: String) {
        println!("  {msg}");
        self.logs.push(msg);
    }
    pub fn drain_logs(&mut self) -> Vec<String> {
        std::mem::take(&mut self.logs)
    }
    pub fn utxos(&self) -> Vec<&Utxo> {
        self.utxos.values().collect()
    }

    // 라벨 → 지갑 (없으면 새 키쌍 생성)
    fn ensure_wallet(&mut self, label: &str) -> (String, String) {
        if !self.wallets.contains_key(label) {
            let w = Wallet::generate();
            self.log(format!(
                "[지갑] '{label}' 키쌍 생성 → 주소 {} (공개키 {}…)",
                w.address,
                &w.pubkey_hex[..14]
            ));
            self.wallets.insert(label.to_string(), w);
        }
        let w = &self.wallets[label];
        (w.address.clone(), w.pubkey_hex.clone())
    }

    // 주소 → 라벨 (표시용 역매핑)
    pub fn label_of(&self, address: &str) -> Option<String> {
        self.wallets
            .iter()
            .find(|(_, w)| w.address == address)
            .map(|(l, _)| l.clone())
    }

    pub fn wallets_list(&self) -> Vec<(String, String, String)> {
        let mut v: Vec<(String, String, String)> = self
            .wallets
            .iter()
            .map(|(l, w)| (l.clone(), w.address.clone(), w.pubkey_hex.clone()))
            .collect();
        v.sort_by(|a, b| a.0.cmp(&b.0));
        v
    }

    pub fn balance(&self, address: &str) -> f64 {
        self.utxos
            .values()
            .filter(|u| u.address == address)
            .map(|u| u.amount)
            .sum()
    }

    fn make_txid(&mut self, inputs: &[Input], outputs: &[Output], tag: &str) -> String {
        self.counter += 1;
        let mut s = format!("{tag}#{}", self.counter);
        for i in inputs {
            s.push_str(&format!("|in:{}:{}", i.txid, i.vout));
        }
        for o in outputs {
            s.push_str(&format!("|out:{}:{}", o.address, o.amount));
        }
        sha256_hex(&s)
    }

    // 서명 대상 메시지(입력이 가리키는 출처 + 출력들) — 서명은 이 내용에 대해 한다.
    fn tx_message(inputs: &[Input], outputs: &[Output]) -> String {
        let mut s = String::new();
        for i in inputs {
            s.push_str(&format!("in:{}:{};", i.txid, i.vout));
        }
        for o in outputs {
            s.push_str(&format!("out:{}:{};", o.address, o.amount));
        }
        s
    }

    // ============================================================
    // 코인 발행 (코인베이스 단순화)
    // ============================================================
    pub fn fund(&mut self, label: &str, amount: f64) -> SendResult {
        let (address, _pubkey) = self.ensure_wallet(label);
        let outputs = vec![Output {
            address: address.clone(),
            amount,
        }];
        let txid = self.make_txid(&[], &outputs, "coinbase");

        let utxo = Utxo {
            txid: txid.clone(),
            vout: 0,
            address: address.clone(),
            amount,
        };
        self.utxos.insert(Utxo::key(&txid, 0), utxo.clone());

        self.log(format!(
            "[발행] 코인베이스 → {label}({}): {amount} BTC (새 UTXO {}:0)",
            address,
            &txid[..10]
        ));

        let mut r = SendResult::fail(""); // 틀 재사용
        r.ok = true;
        r.error = None;
        r.txid = txid;
        r.created = vec![(utxo, false)];
        r
    }

    fn collect_inputs(&self, owner_addr: &str, need: f64) -> Result<(Vec<Utxo>, f64), String> {
        let mut owned: Vec<Utxo> = self
            .utxos
            .values()
            .filter(|u| u.address == owner_addr)
            .cloned()
            .collect();
        // 큰 금액부터 (단순 그리디 코인 선택)
        owned.sort_by(|a, b| b.amount.partial_cmp(&a.amount).unwrap());

        let mut selected = Vec::new();
        let mut sum = 0.0;
        for u in owned {
            if sum >= need {
                break;
            }
            sum += u.amount;
            selected.push(u);
        }
        if sum + 1e-9 < need {
            return Err(format!(
                "잔액 부족: 모을 수 있는 건 {sum:.4} BTC인데 {need:.4} BTC가 필요합니다."
            ));
        }
        Ok((selected, sum))
    }

    // 서명 검증: 각 입력의 (공개키, 서명)이 (UTXO가 잠긴 주소, 메시지)에 대해 유효한가?
    fn verify_inputs(&self, inputs: &[Input], message: &str) -> Result<(), String> {
        for inp in inputs {
            let utxo = self
                .utxos
                .get(&Utxo::key(&inp.txid, inp.vout))
                .ok_or_else(|| "존재하지 않거나 이미 쓰인 UTXO를 가리킵니다.".to_string())?;

            // (1) 제시한 공개키가 정말 그 UTXO의 주소로 유도되는가?
            let derived = address_from_pubkey_hex(&inp.pubkey);
            if derived != utxo.address {
                return Err(format!(
                    "서명한 키의 주소({derived})가 UTXO 소유자 주소({})와 다릅니다 → 남의 동전입니다.",
                    utxo.address
                ));
            }
            // (2) 서명이 메시지에 대해 수학적으로 유효한가?
            let vk = VerifyingKey::from_sec1_bytes(&from_hex(&inp.pubkey))
                .map_err(|_| "공개키 형식이 잘못되었습니다.".to_string())?;
            let sig = Signature::from_slice(&from_hex(&inp.signature))
                .map_err(|_| "서명 형식이 잘못되었습니다.".to_string())?;
            if vk.verify(message.as_bytes(), &sig).is_err() {
                return Err("서명이 메시지와 맞지 않습니다(검증 실패).".to_string());
            }
        }
        Ok(())
    }

    // ============================================================
    // 송금 (정상): from이 자기 개인키로 서명
    // ============================================================
    pub fn send(&mut self, from_label: &str, to_label: &str, amount: f64, fee: f64) -> SendResult {
        if amount <= 0.0 {
            return SendResult::fail("금액은 0보다 커야 합니다.");
        }
        if fee < 0.0 {
            return SendResult::fail("수수료는 음수가 될 수 없습니다.");
        }

        let (from_addr, from_pub) = self.ensure_wallet(from_label);
        let (to_addr, _) = self.ensure_wallet(to_label);
        let need = amount + fee;

        let (selected, sum) = match self.collect_inputs(&from_addr, need) {
            Ok(v) => v,
            Err(e) => return SendResult::fail(&e),
        };

        // 출력 구성
        let change = sum - amount - fee;
        let mut outputs = vec![Output {
            address: to_addr.clone(),
            amount,
        }];
        let has_change = change > 1e-9;
        if has_change {
            outputs.push(Output {
                address: from_addr.clone(),
                amount: change,
            });
        }

        // 입력(서명 전)
        let mut inputs: Vec<Input> = selected
            .iter()
            .map(|u| Input {
                txid: u.txid.clone(),
                vout: u.vout,
                signature: String::new(),
                pubkey: String::new(),
            })
            .collect();

        // 서명 대상 메시지 + 서명
        let message = Self::tx_message(&inputs, &outputs);
        let sighash = sha256_hex(&message);
        let sig: Signature = self.wallets[from_label].sk.sign(message.as_bytes());
        let sig_hex = to_hex(&sig.to_bytes());

        // 입력마다 서명/공개키 첨부
        for inp in inputs.iter_mut() {
            inp.signature = sig_hex.clone();
            inp.pubkey = from_pub.clone();
        }

        // 검증 (정상 거래이므로 통과)
        if let Err(e) = self.verify_inputs(&inputs, &message) {
            return SendResult::fail(&format!("검증 실패: {e}"));
        }

        let txid = self.make_txid(&inputs, &outputs, "tx");

        // UTXO 집합 갱신
        for u in &selected {
            self.utxos.remove(&Utxo::key(&u.txid, u.vout));
        }
        let mut created = Vec::new();
        for (vout, out) in outputs.iter().enumerate() {
            let is_change = has_change && vout == 1;
            let u = Utxo {
                txid: txid.clone(),
                vout: vout as u32,
                address: out.address.clone(),
                amount: out.amount,
            };
            self.utxos.insert(Utxo::key(&txid, vout as u32), u.clone());
            created.push((u, is_change));
        }

        self.log(format!(
            "[거래] {from_label} → {to_label}: {amount} BTC | 서명 검증 ✅ | 입력 {}개(합 {:.4}) 소비, 거스름돈 {:.4}, 수수료 {:.4}",
            selected.len(),
            sum,
            change.max(0.0),
            fee
        ));

        SendResult {
            ok: true,
            error: None,
            txid,
            spent: selected,
            created,
            fee,
            selected_sum: sum,
            sighash,
            signature: sig_hex,
            pubkey: from_pub,
            signer_label: from_label.to_string(),
            signer_address: from_addr.clone(),
            lock_address: from_addr,
            verified: true,
        }
    }

    // ============================================================
    // 위조 시도(도둑질): attacker가 victim의 UTXO를 자기 키로 서명해 가로채려 함
    // ============================================================
    // attacker는 victim의 개인키가 없으므로:
    //   - 자기 키로 서명할 수밖에 없고
    //   - 그 키의 주소는 victim의 주소와 다르다
    //   → 검증 단계에서 "주소 불일치"로 거부된다. (거래는 적용되지 않음)
    pub fn forge(
        &mut self,
        attacker_label: &str,
        victim_label: &str,
        to_label: &str,
        amount: f64,
    ) -> SendResult {
        if amount <= 0.0 {
            return SendResult::fail("금액은 0보다 커야 합니다.");
        }
        let (attacker_addr, attacker_pub) = self.ensure_wallet(attacker_label);
        let (victim_addr, _) = self.ensure_wallet(victim_label);
        let (to_addr, _) = self.ensure_wallet(to_label);

        let (selected, sum) = match self.collect_inputs(&victim_addr, amount) {
            Ok(v) => v,
            Err(e) => return SendResult::fail(&format!("{victim_label}의 {e}")),
        };

        let change = sum - amount;
        let mut outputs = vec![Output {
            address: to_addr.clone(),
            amount,
        }];
        if change > 1e-9 {
            outputs.push(Output {
                address: victim_addr.clone(),
                amount: change,
            });
        }

        let mut inputs: Vec<Input> = selected
            .iter()
            .map(|u| Input {
                txid: u.txid.clone(),
                vout: u.vout,
                signature: String::new(),
                pubkey: String::new(),
            })
            .collect();

        let message = Self::tx_message(&inputs, &outputs);
        let sighash = sha256_hex(&message);
        // 도둑은 자기 키로 서명 (피해자 키가 없으니까)
        let sig: Signature = self.wallets[attacker_label].sk.sign(message.as_bytes());
        let sig_hex = to_hex(&sig.to_bytes());
        for inp in inputs.iter_mut() {
            inp.signature = sig_hex.clone();
            inp.pubkey = attacker_pub.clone();
        }

        // 검증 → 실패해야 정상
        let verify = self.verify_inputs(&inputs, &message);
        let created: Vec<(Utxo, bool)> = outputs
            .iter()
            .enumerate()
            .map(|(vout, out)| {
                (
                    Utxo {
                        txid: "(거부됨)".to_string(),
                        vout: vout as u32,
                        address: out.address.clone(),
                        amount: out.amount,
                    },
                    change > 1e-9 && vout == 1,
                )
            })
            .collect();

        match verify {
            Ok(()) => {
                // 일어나면 안 되는 경우 (예: attacker==victim)
                self.log("[경고] 위조 시도가 검증을 통과했습니다(공격자=피해자?).".to_string());
                SendResult::fail("이 경우는 사실상 본인 거래입니다.")
            }
            Err(reason) => {
                self.log(format!(
                    "[위조 거부] {attacker_label}가 {victim_label}의 동전을 훔치려 함 → {reason}"
                ));
                SendResult {
                    ok: false,
                    error: Some(reason),
                    txid: String::new(),
                    spent: selected,
                    created,
                    fee: 0.0,
                    selected_sum: sum,
                    sighash,
                    signature: sig_hex,
                    pubkey: attacker_pub,
                    signer_label: attacker_label.to_string(),
                    signer_address: attacker_addr,
                    lock_address: victim_addr,
                    verified: false,
                }
            }
        }
    }
}

impl Default for UtxoEngine {
    fn default() -> Self {
        Self::new()
    }
}
