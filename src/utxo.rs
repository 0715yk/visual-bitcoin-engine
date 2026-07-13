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

// 입력(소비할 UTXO) 하나에 대한 서명·검증 상세 (화면 카드용)
// 실제 비트코인처럼 "입력마다 각자 서명"하므로 입력 개수만큼 생긴다.
#[derive(Clone, serde::Serialize)]
pub struct InputSig {
    pub txid: String,
    pub vout: u32,
    pub message: String,       // 이 입력이 서명한 원문(직렬화). SHA-256하면 sighash
    pub sighash: String,       // 이 입력의 sighash
    pub signature: String,     // 이 입력의 서명(hex, r‖s)
    pub pubkey: String,        // 서명에 쓴 공개키(hex)
    pub signer_label: String,  // 그 공개키 주인의 라벨(있으면)
    pub signer_address: String, // 공개키를 해시한 주소
    pub lock_address: String,  // 이 입력이 가리키는 UTXO가 잠긴 주소
    pub owner_ok: bool,        // (a) 주인 확인: signer_address == lock_address
    pub sig_ok: bool,          // (b) 동의 확인: 서명이 메시지에 대해 유효
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
    pub message: String,       // 서명 대상 원문(직렬화된 거래 내용) → 이걸 SHA-256하면 sighash
    pub sighash: String,       // 서명 대상 메시지의 해시
    pub signature: String,     // 만들어진 서명(hex)
    pub pubkey: String,        // 서명자의 공개키(hex)
    pub signer_label: String,  // 서명한 사람(라벨)
    pub signer_address: String, // 서명자의 주소
    pub lock_address: String,  // 소비하려는 UTXO가 잠긴 주소
    pub verified: bool,        // 서명 검증 통과 여부

    // --- 입력별 서명 상세 (실제 비트코인처럼 입력마다 각자 서명) ---
    pub inputs_sig: Vec<InputSig>,
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
            message: String::new(),
            sighash: String::new(),
            signature: String::new(),
            pubkey: String::new(),
            signer_label: String::new(),
            signer_address: String::new(),
            lock_address: String::new(),
            verified: false,
            inputs_sig: vec![],
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

    // 거래 공통부(모든 입력의 출처 + 모든 출력) — 모든 입력의 서명이 공유하는 뼈대.
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

    // 특정 입력 하나가 실제로 서명하는 원문.
    // = 거래 공통부 + "지금 서명 중인 입력이 어느 것인지"(spending) 를 덧붙인다.
    // 이렇게 하면 입력마다 sighash가 달라져, 입력별로 서로 다른 서명이 생긴다.
    // (실제 비트코인의 SIGHASH_ALL이 입력별 scriptCode를 함께 커밋하는 것에 대응)
    fn input_message(inputs: &[Input], outputs: &[Output], txid: &str, vout: u32) -> String {
        let mut s = Self::tx_message(inputs, outputs);
        s.push_str(&format!("spending:{txid}:{vout};"));
        s
    }

    // 각 입력에 대한 서명·검증 상세(InputSig)를 만든다.
    // 입력마다: (a) 제시한 공개키의 주소 == UTXO 잠긴 주소?  (b) 서명이 그 입력의 메시지에 유효?
    fn build_input_sigs(&self, inputs: &[Input], outputs: &[Output]) -> Vec<InputSig> {
        inputs
            .iter()
            .map(|inp| {
                let message = Self::input_message(inputs, outputs, &inp.txid, inp.vout);
                let sighash = sha256_hex(&message);

                let lock_address = self
                    .utxos
                    .get(&Utxo::key(&inp.txid, inp.vout))
                    .map(|u| u.address.clone())
                    .unwrap_or_default();

                let signer_address = if inp.pubkey.is_empty() {
                    String::new()
                } else {
                    address_from_pubkey_hex(&inp.pubkey)
                };
                let owner_ok = !lock_address.is_empty() && signer_address == lock_address;

                // (b) 서명이 이 입력의 메시지에 대해 수학적으로 유효한가?
                let sig_ok = (|| -> Option<bool> {
                    let vk = VerifyingKey::from_sec1_bytes(&from_hex(&inp.pubkey)).ok()?;
                    let sig = Signature::from_slice(&from_hex(&inp.signature)).ok()?;
                    Some(vk.verify(message.as_bytes(), &sig).is_ok())
                })()
                .unwrap_or(false);

                let signer_label = self.label_of(&signer_address).unwrap_or_default();

                InputSig {
                    txid: inp.txid.clone(),
                    vout: inp.vout,
                    message,
                    sighash,
                    signature: inp.signature.clone(),
                    pubkey: inp.pubkey.clone(),
                    signer_label,
                    signer_address,
                    lock_address,
                    owner_ok,
                    sig_ok,
                }
            })
            .collect()
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

    // 입력마다 각자 서명한다(실제 비트코인 방식).
    // 각 입력은 "그 입력의 메시지"(공통부 + 어느 입력을 쓰는지)에 대해 개인키로 서명하고,
    // (서명, 공개키)를 자기 입력에 채운다. 입력별로 메시지가 달라 서명도 서로 다르다.
    fn sign_inputs(inputs: &mut [Input], outputs: &[Output], sk: &SigningKey, pubkey: &str) {
        // 출처(txid:vout)는 서명 과정에서 바뀌지 않으므로 스냅샷으로 메시지를 만든다.
        let snapshot: Vec<Input> = inputs.to_vec();
        for inp in inputs.iter_mut() {
            let msg = Self::input_message(&snapshot, outputs, &inp.txid, inp.vout);
            let sig: Signature = sk.sign(msg.as_bytes());
            inp.signature = to_hex(&sig.to_bytes());
            inp.pubkey = pubkey.to_string();
        }
    }

    // 입력별 검증 결과로부터 전체 통과 여부와 첫 실패 사유를 뽑는다.
    fn overall_verdict(sigs: &[InputSig]) -> (bool, Option<String>) {
        if sigs.is_empty() {
            return (false, Some("서명할 입력이 없습니다.".to_string()));
        }
        for s in sigs {
            if !s.owner_ok {
                return (
                    false,
                    Some(format!(
                        "서명한 키의 주소({})가 UTXO 소유자 주소({})와 다릅니다 → 남의 동전입니다.",
                        s.signer_address, s.lock_address
                    )),
                );
            }
            if !s.sig_ok {
                return (
                    false,
                    Some("서명이 메시지와 맞지 않습니다(검증 실패).".to_string()),
                );
            }
        }
        (true, None)
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

        // 입력마다 자기 개인키로 "그 입력의 메시지"에 각각 서명 (실제 비트코인 방식)
        Self::sign_inputs(&mut inputs, &outputs, &self.wallets[from_label].sk, &from_pub);

        // 입력별 서명·검증 상세 (UTXO를 제거하기 전에 계산 — 잠긴 주소를 조회해야 함)
        let inputs_sig = self.build_input_sigs(&inputs, &outputs);
        let (all_ok, fail_reason) = Self::overall_verdict(&inputs_sig);
        if !all_ok {
            return SendResult::fail(&format!(
                "검증 실패: {}",
                fail_reason.unwrap_or_default()
            ));
        }

        // 대표값(요약 표시용) — 첫 입력 기준
        let rep_message = inputs_sig.first().map(|s| s.message.clone()).unwrap_or_default();
        let rep_sighash = inputs_sig.first().map(|s| s.sighash.clone()).unwrap_or_default();
        let rep_sig = inputs_sig.first().map(|s| s.signature.clone()).unwrap_or_default();

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
            message: rep_message,
            sighash: rep_sighash,
            signature: rep_sig,
            pubkey: from_pub,
            signer_label: from_label.to_string(),
            signer_address: from_addr.clone(),
            lock_address: from_addr,
            verified: true,
            inputs_sig,
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

        // 도둑은 자기 키로 각 입력에 서명 (피해자 개인키가 없으니까)
        Self::sign_inputs(&mut inputs, &outputs, &self.wallets[attacker_label].sk, &attacker_pub);

        // 입력별 검증 상세 — 도둑 키의 주소 != 피해자 주소이므로 owner_ok=false 로 거부됨
        let inputs_sig = self.build_input_sigs(&inputs, &outputs);
        let (all_ok, fail_reason) = Self::overall_verdict(&inputs_sig);

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

        let rep_message = inputs_sig.first().map(|s| s.message.clone()).unwrap_or_default();
        let rep_sighash = inputs_sig.first().map(|s| s.sighash.clone()).unwrap_or_default();
        let rep_sig = inputs_sig.first().map(|s| s.signature.clone()).unwrap_or_default();

        if all_ok {
            // 일어나면 안 되는 경우 (예: attacker==victim)
            self.log("[경고] 위조 시도가 검증을 통과했습니다(공격자=피해자?).".to_string());
            return SendResult::fail("이 경우는 사실상 본인 거래입니다.");
        }

        let reason = fail_reason.unwrap_or_else(|| "검증 실패".to_string());
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
            message: rep_message,
            sighash: rep_sighash,
            signature: rep_sig,
            pubkey: attacker_pub,
            signer_label: attacker_label.to_string(),
            signer_address: attacker_addr,
            lock_address: victim_addr,
            verified: false,
            inputs_sig,
        }
    }
}

impl Default for UtxoEngine {
    fn default() -> Self {
        Self::new()
    }
}
