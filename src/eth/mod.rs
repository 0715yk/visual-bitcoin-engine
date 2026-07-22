// ============================================================
// eth/ — 교육용 Ethereum PoS 엔진 (스펙 호환 목표 아님)
// ============================================================
// Gasper 라이트: 슬롯/에포크 · 제안자 추첨 · attest 가중치 ·
// 2/3 슈퍼머조리티 파이널리티 · 슬래싱. 풀 EVM/BLS 미포함.

pub mod account;
pub mod consensus;
pub mod contract;
pub mod evm;
pub mod keccak;
pub mod staking;

pub use account::AccountLedger;
pub use consensus::PosChain;
pub use contract::ContractRegistry;
pub use staking::StakingRegistry;
