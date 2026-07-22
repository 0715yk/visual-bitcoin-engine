// ============================================================
// evm.rs — 교육용 미니 EVM 인터프리터 (스펙 호환 목표 아님)
// ============================================================
// 진짜 EVM처럼 "스택 기반 가상머신"을 아주 작은 opcode 서브셋으로 흉내낸다.
// - 스택 머신: 모든 연산은 스택에서 pop → 계산 → push
// - 워드는 256비트지만, 교육 데모라 내부 계산은 u128 로 한다 (작은 수 전제).
//   화면에는 32바이트(64 hex) 로 패딩해 "256비트 워드"임을 보여준다.
// - opcode 마다 gas 를 차감한다 (근사치). gas 가 바닥나면 out-of-gas revert.
// - tx 하나를 "끝까지 실행(run-to-completion)" 하고, 매 스텝의 스냅샷을 남긴다.
//
// 지원 opcode (서브셋):
//   STOP ADD MUL SUB POP MLOAD MSTORE SLOAD SSTORE CALLDATALOAD
//   JUMP JUMPI JUMPDEST PUSH1 DUP1 SWAP1 ISZERO EQ LT GT

use serde::Serialize;
use std::collections::BTreeMap;

/// 데모용 워드 (실제 EVM 은 256비트). 작은 수 전제로 u128 사용.
type Word = u128;

/// 32바이트(64 hex) 로 패딩한 hex 문자열 — "256비트 워드"임을 보여주기 위함
fn word_hex(w: Word) -> String {
    // u128 은 16바이트 → 앞에 16바이트(0) 를 더 붙여 32바이트로
    format!("{:032x}{:032x}", 0u128, w)
}

#[derive(Serialize, Clone)]
pub struct Step {
    /// 스텝 인덱스 (0 = 실행 전 초기 상태)
    pub i: usize,
    pub pc: usize,
    pub op: String,
    pub op_hex: String,
    /// PUSH 계열의 즉시값 (hex, 없으면 null)
    pub arg: Option<String>,
    pub gas_cost: u64,
    pub gas_left: u64,
    /// 스택 (top 이 index 0). 각 원소는 32바이트 hex
    pub stack: Vec<String>,
    /// 사용된 메모리 (hex, 없으면 빈 문자열)
    pub memory: String,
    /// 스토리지 slot(hex) → value(hex)
    pub storage: BTreeMap<String, String>,
    /// 이번 스텝에서 바뀐 스토리지 슬롯 (hex, 없으면 null)
    pub changed_slot: Option<String>,
    pub halted: bool,
    pub reverted: bool,
    /// out-of-gas / stack underflow 등 사유
    pub revert_reason: Option<String>,
}

#[derive(Serialize)]
pub struct DisasmLine {
    pub pc: usize,
    pub op: String,
    pub op_hex: String,
    pub arg: Option<String>,
    pub gas: u64,
}

#[derive(Serialize)]
pub struct RunResult {
    pub program: String,
    pub bytecode: String,
    pub disasm: Vec<DisasmLine>,
    pub calldata: String,
    pub gas_limit: u64,
    pub gas_used: u64,
    pub steps: Vec<Step>,
    pub final_storage: BTreeMap<String, String>,
    pub ok: bool,
    pub error: Option<String>,
}

/// 정적 gas 비용 (근사치). SSTORE 는 상황별로 동적.
fn base_gas(op: u8) -> u64 {
    match op {
        0x00 => 0,             // STOP
        0x01 | 0x03 => 3,      // ADD SUB (verylow)
        0x02 => 5,             // MUL (low)
        0x10 | 0x11 | 0x14 | 0x15 => 3, // LT GT EQ ISZERO
        0x35 => 3,             // CALLDATALOAD
        0x50 => 2,             // POP
        0x51 | 0x52 => 3,      // MLOAD MSTORE (+메모리확장 생략)
        0x54 => 2100,          // SLOAD (cold, 근사치)
        0x56 => 8,             // JUMP (mid)
        0x57 => 10,            // JUMPI (high)
        0x5b => 1,             // JUMPDEST
        0x60 => 3,             // PUSH1 (verylow)
        0x80 => 3,             // DUP1
        0x90 => 3,             // SWAP1
        _ => 0,
    }
}

fn op_name(op: u8) -> &'static str {
    match op {
        0x00 => "STOP",
        0x01 => "ADD",
        0x02 => "MUL",
        0x03 => "SUB",
        0x10 => "LT",
        0x11 => "GT",
        0x14 => "EQ",
        0x15 => "ISZERO",
        0x35 => "CALLDATALOAD",
        0x50 => "POP",
        0x51 => "MLOAD",
        0x52 => "MSTORE",
        0x54 => "SLOAD",
        0x55 => "SSTORE",
        0x56 => "JUMP",
        0x57 => "JUMPI",
        0x5b => "JUMPDEST",
        0x60 => "PUSH1",
        0x80 => "DUP1",
        0x90 => "SWAP1",
        _ => "INVALID",
    }
}

/// 프로그램 id → (바이트코드, calldata 사용 여부)
pub fn program_bytecode(id: &str) -> Option<(Vec<u8>, bool)> {
    match id {
        // set(uint v) { x = v + 1; }  — x 는 storage slot 0, v 는 calldata offset 0
        //   PUSH1 0x00, CALLDATALOAD, PUSH1 0x01, ADD, PUSH1 0x00, SSTORE, STOP
        "store" => Some((
            vec![0x60, 0x00, 0x35, 0x60, 0x01, 0x01, 0x60, 0x00, 0x55, 0x00],
            true,
        )),
        // (3 + 4) * 2  — 순수 스택 산술 (스토리지/calldata 없음)
        //   PUSH1 3, PUSH1 4, ADD, PUSH1 2, MUL, STOP
        "arith" => Some((
            vec![0x60, 0x03, 0x60, 0x04, 0x01, 0x60, 0x02, 0x02, 0x00],
            false,
        )),
        // 부동산 에스크로 happy path 요약 (교육용 · 권한/msg.value 생략)
        // storage: slot0=state(0 Listed→1 Funded→2 Confirmed→3 Released)
        //          slot1=price(calldata)  slot2=locked
        // list → deposit → confirm → release
        "escrow" => Some((
            vec![
                // price = calldata
                0x60, 0x00, 0x35, // PUSH1 0, CALLDATALOAD
                0x60, 0x01, 0x55, // PUSH1 1, SSTORE  → slot1 = price
                // state = Listed(0)
                0x60, 0x00, 0x60, 0x00, 0x55, // PUSH1 0, PUSH1 0, SSTORE
                // locked = 0
                0x60, 0x00, 0x60, 0x02, 0x55, // PUSH1 0, PUSH1 2, SSTORE
                // deposit: state = Funded(1)
                0x60, 0x01, 0x60, 0x00, 0x55, // PUSH1 1, PUSH1 0, SSTORE
                // locked = price (SLOAD slot1)
                0x60, 0x01, 0x54, // PUSH1 1, SLOAD
                0x60, 0x02, 0x55, // PUSH1 2, SSTORE
                // confirm: state = Confirmed(2)
                0x60, 0x02, 0x60, 0x00, 0x55, // PUSH1 2, PUSH1 0, SSTORE
                // release: state = Released(3), locked = 0
                0x60, 0x03, 0x60, 0x00, 0x55, // PUSH1 3, PUSH1 0, SSTORE
                0x60, 0x00, 0x60, 0x02, 0x55, // PUSH1 0, PUSH1 2, SSTORE
                0x00, // STOP
            ],
            true,
        )),
        _ => None,
    }
}

pub fn disassemble(code: &[u8]) -> Vec<DisasmLine> {
    let mut out = Vec::new();
    let mut pc = 0usize;
    while pc < code.len() {
        let op = code[pc];
        let (arg, size) = if op == 0x60 && pc + 1 < code.len() {
            (Some(format!("0x{:02x}", code[pc + 1])), 2)
        } else {
            (None, 1)
        };
        let g = if op == 0x55 { 20000 } else { base_gas(op) };
        out.push(DisasmLine {
            pc,
            op: op_name(op).to_string(),
            op_hex: format!("{:02x}", op),
            arg,
            gas: g,
        });
        pc += size;
    }
    out
}

struct Machine {
    code: Vec<u8>,
    pc: usize,
    stack: Vec<Word>,
    memory: Vec<u8>,
    storage: BTreeMap<Word, Word>,
    gas_left: u64,
    calldata: Word,
    halted: bool,
    reverted: bool,
    revert_reason: Option<String>,
}

impl Machine {
    fn stack_hex(&self) -> Vec<String> {
        // top 이 먼저 오도록 뒤집어서
        self.stack.iter().rev().map(|w| word_hex(*w)).collect()
    }
    fn storage_hex(&self) -> BTreeMap<String, String> {
        self.storage
            .iter()
            .map(|(k, v)| (word_hex(*k), word_hex(*v)))
            .collect()
    }
    fn memory_hex(&self) -> String {
        if self.memory.is_empty() {
            String::new()
        } else {
            self.memory.iter().map(|b| format!("{:02x}", b)).collect()
        }
    }
    fn pop(&mut self) -> Result<Word, String> {
        self.stack.pop().ok_or_else(|| "stack underflow".into())
    }
}

/// 프로그램을 끝까지 실행하며 매 스텝의 스냅샷을 남긴다.
pub fn run(program: &str, calldata: Word, gas_limit: u64) -> RunResult {
    let (code, uses_calldata) = match program_bytecode(program) {
        Some(x) => x,
        None => {
            return RunResult {
                program: program.into(),
                bytecode: String::new(),
                disasm: vec![],
                calldata: word_hex(0),
                gas_limit,
                gas_used: 0,
                steps: vec![],
                final_storage: BTreeMap::new(),
                ok: false,
                error: Some(format!("알 수 없는 프로그램: {}", program)),
            }
        }
    };
    let calldata = if uses_calldata { calldata } else { 0 };

    let bytecode: String = code.iter().map(|b| format!("{:02x}", b)).collect();
    let disasm = disassemble(&code);

    let mut m = Machine {
        code,
        pc: 0,
        stack: Vec::new(),
        memory: Vec::new(),
        storage: BTreeMap::new(),
        gas_left: gas_limit,
        calldata,
        halted: false,
        reverted: false,
        revert_reason: None,
    };

    let mut steps: Vec<Step> = Vec::new();
    // 스텝 0: 실행 전 초기 상태
    steps.push(Step {
        i: 0,
        pc: 0,
        op: "INIT".into(),
        op_hex: String::new(),
        arg: None,
        gas_cost: 0,
        gas_left: m.gas_left,
        stack: vec![],
        memory: String::new(),
        storage: BTreeMap::new(),
        changed_slot: None,
        halted: false,
        reverted: false,
        revert_reason: None,
    });

    let mut i = 0usize;
    let max_steps = 10_000; // 무한루프 안전장치
    while !m.halted && !m.reverted && m.pc < m.code.len() && i < max_steps {
        i += 1;
        let exec_pc = m.pc; // 이번 스텝이 실행하는 opcode 위치 (하이라이트용)
        let op = m.code[m.pc];
        let name = op_name(op).to_string();
        let op_hex = format!("{:02x}", op);
        let mut arg: Option<String> = None;
        let mut changed_slot: Option<String> = None;
        let mut next_pc = m.pc + 1;

        // gas 계산 (SSTORE 는 아래에서 동적으로 보정)
        let mut gas_cost = base_gas(op);

        let exec: Result<(), String> = (|| {
            match op {
                0x00 => {
                    m.halted = true;
                }
                0x01 => {
                    let a = m.pop()?;
                    let b = m.pop()?;
                    m.stack.push(a.wrapping_add(b));
                }
                0x02 => {
                    let a = m.pop()?;
                    let b = m.pop()?;
                    m.stack.push(a.wrapping_mul(b));
                }
                0x03 => {
                    let a = m.pop()?;
                    let b = m.pop()?;
                    m.stack.push(a.wrapping_sub(b));
                }
                0x10 => {
                    let a = m.pop()?;
                    let b = m.pop()?;
                    m.stack.push(if a < b { 1 } else { 0 });
                }
                0x11 => {
                    let a = m.pop()?;
                    let b = m.pop()?;
                    m.stack.push(if a > b { 1 } else { 0 });
                }
                0x14 => {
                    let a = m.pop()?;
                    let b = m.pop()?;
                    m.stack.push(if a == b { 1 } else { 0 });
                }
                0x15 => {
                    let a = m.pop()?;
                    m.stack.push(if a == 0 { 1 } else { 0 });
                }
                0x35 => {
                    // CALLDATALOAD(offset): 데모는 offset 0 에서만 32바이트 워드
                    let _offset = m.pop()?;
                    m.stack.push(m.calldata);
                }
                0x50 => {
                    m.pop()?;
                }
                0x51 => {
                    // MLOAD(offset)
                    let off = m.pop()? as usize;
                    let mut buf = [0u8; 16];
                    for (k, b) in buf.iter_mut().enumerate() {
                        *b = m.memory.get(off + 16 + k).copied().unwrap_or(0);
                    }
                    m.stack.push(u128::from_be_bytes(buf));
                }
                0x52 => {
                    // MSTORE(offset, value)
                    let off = m.pop()? as usize;
                    let val = m.pop()?;
                    if m.memory.len() < off + 32 {
                        m.memory.resize(off + 32, 0);
                    }
                    // 하위 16바이트에 u128 기록 (상위 16바이트는 0)
                    let bytes = val.to_be_bytes();
                    for k in 0..16 {
                        m.memory[off + 16 + k] = bytes[k];
                    }
                }
                0x54 => {
                    // SLOAD(key)
                    let key = m.pop()?;
                    let v = m.storage.get(&key).copied().unwrap_or(0);
                    m.stack.push(v);
                }
                0x55 => {
                    // SSTORE(key, value) — key 가 top
                    let key = m.pop()?;
                    let val = m.pop()?;
                    let prev = m.storage.get(&key).copied().unwrap_or(0);
                    // 동적 gas (근사): 0→nonzero = 20000, 그 외 변경 = 5000
                    gas_cost = if prev == 0 && val != 0 { 20000 } else { 5000 };
                    m.storage.insert(key, val);
                    changed_slot = Some(word_hex(key));
                }
                0x56 => {
                    // JUMP(dest)
                    let dest = m.pop()? as usize;
                    if m.code.get(dest).copied() != Some(0x5b) {
                        return Err("잘못된 점프 대상 (JUMPDEST 아님)".into());
                    }
                    next_pc = dest;
                }
                0x57 => {
                    // JUMPI(dest, cond)
                    let dest = m.pop()? as usize;
                    let cond = m.pop()?;
                    if cond != 0 {
                        if m.code.get(dest).copied() != Some(0x5b) {
                            return Err("잘못된 점프 대상 (JUMPDEST 아님)".into());
                        }
                        next_pc = dest;
                    }
                }
                0x5b => { /* JUMPDEST: no-op */ }
                0x60 => {
                    // PUSH1
                    let b = m.code.get(m.pc + 1).copied().unwrap_or(0);
                    arg = Some(format!("0x{:02x}", b));
                    m.stack.push(b as Word);
                    next_pc = m.pc + 2;
                }
                0x80 => {
                    // DUP1
                    let top = *m.stack.last().ok_or("stack underflow")?;
                    m.stack.push(top);
                }
                0x90 => {
                    // SWAP1
                    let n = m.stack.len();
                    if n < 2 {
                        return Err("stack underflow".into());
                    }
                    m.stack.swap(n - 1, n - 2);
                }
                _ => return Err(format!("지원하지 않는 opcode: 0x{:02x}", op)),
            }
            Ok(())
        })();

        // gas 소모
        if m.gas_left < gas_cost {
            m.gas_left = 0;
            m.reverted = true;
            m.revert_reason = Some("out of gas".into());
        } else if let Err(e) = exec {
            m.gas_left = m.gas_left.saturating_sub(gas_cost);
            m.reverted = true;
            m.revert_reason = Some(e);
        } else {
            m.gas_left -= gas_cost;
            m.pc = next_pc;
        }

        steps.push(Step {
            i,
            pc: exec_pc,
            op: name,
            op_hex,
            arg,
            gas_cost,
            gas_left: m.gas_left,
            stack: m.stack_hex(),
            memory: m.memory_hex(),
            storage: m.storage_hex(),
            changed_slot,
            halted: m.halted,
            reverted: m.reverted,
            revert_reason: m.revert_reason.clone(),
        });
    }

    let gas_used = gas_limit - m.gas_left;
    let ok = !m.reverted;
    RunResult {
        program: program.into(),
        bytecode,
        disasm,
        calldata: word_hex(calldata),
        gas_limit,
        gas_used,
        steps,
        final_storage: m.storage_hex(),
        ok,
        error: m.revert_reason,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn store_writes_v_plus_one() {
        let r = run("store", 41, 100_000);
        assert!(r.ok, "should not revert: {:?}", r.error);
        // storage slot 0 == 42
        let slot0 = word_hex(0);
        assert_eq!(r.final_storage.get(&slot0), Some(&word_hex(42)));
        // gas: 3+3+3+3+3 + 20000(SSTORE fresh) = 20015
        assert_eq!(r.gas_used, 20015);
        // 마지막 스텝은 STOP(halted)
        assert!(r.steps.last().unwrap().halted);
    }

    #[test]
    fn arith_result_on_stack() {
        let r = run("arith", 0, 100_000);
        assert!(r.ok);
        // (3+4)*2 = 14, STOP 직전 스텝(=MUL 이후)의 스택 top 이 14
        // 마지막 스텝은 STOP; 그 직전이 MUL
        let mul_step = r.steps.iter().rev().find(|s| s.op == "MUL").unwrap();
        assert_eq!(mul_step.stack[0], word_hex(14));
    }

    #[test]
    fn out_of_gas_reverts() {
        // SSTORE(20000) 를 감당 못하는 낮은 gas
        let r = run("store", 41, 100);
        assert!(!r.ok);
        assert_eq!(r.error.as_deref(), Some("out of gas"));
    }

    #[test]
    fn escrow_happy_path_storage() {
        let r = run("escrow", 5, 500_000);
        assert!(r.ok, "should not revert: {:?}", r.error);
        // state=Released(3), price=5, locked=0
        assert_eq!(r.final_storage.get(&word_hex(0)), Some(&word_hex(3)));
        assert_eq!(r.final_storage.get(&word_hex(1)), Some(&word_hex(5)));
        assert_eq!(r.final_storage.get(&word_hex(2)), Some(&word_hex(0)));
        // SSTORE 가 여러 번 찍혀야 함
        let stores = r.steps.iter().filter(|s| s.op == "SSTORE").count();
        assert!(stores >= 7, "expected several SSTOREs, got {}", stores);
    }
}
