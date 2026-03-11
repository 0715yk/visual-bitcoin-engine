// ============================================================
// config.rs — 블록체인 설정값을 한곳에서 관리하는 모듈
// ============================================================
// 나중에 프론트엔드에서 시각화할 때, 이 값들을 슬라이더/입력창으로
// 바꿔가며 시뮬레이션할 수 있도록 파라미터화한 것이다.
//
// 실제 비트코인의 값들과 교육용으로 축소한 값 모두
// 프리셋(preset)으로 제공한다.

// #[derive(Clone)]을 붙여서 Config를 복사할 수 있게 한다.
// Blockchain에 넘길 때 소유권 이동 없이 복사본을 줄 수 있다.
#[derive(Clone)]
pub struct ChainConfig {
    // --- 채굴 관련 ---

    // 초기 채굴 난이도 (해시 앞에 와야 하는 0의 개수)
    // 비트코인: 1 (2009년 최초)
    pub initial_difficulty: usize,

    // 난이도 조정 주기 (몇 블록마다 난이도를 재계산할지)
    // 비트코인: 2016블록 (약 2주)
    pub adjustment_interval: u64,

    // 블록 1개당 목표 생성 시간 (초)
    // 비트코인: 600초 (10분)
    pub target_time_per_block: u64,

    // --- 보상 관련 (앞으로 구현할 것) ---

    // 최초 채굴 보상 (BTC)
    // 비트코인: 50 BTC (2009년)
    // 현재(2026년): 3.125 BTC (4번 반감)
    pub initial_block_reward: f64,

    // 반감기 주기 (몇 블록마다 보상이 절반으로 줄어드는지)
    // 비트코인: 210,000블록 (약 4년)
    pub halving_interval: u64,

    // --- 블록 관련 (앞으로 구현할 것) ---

    // 블록 1개에 담을 수 있는 최대 거래 수
    // 비트코인: 용량 기반 (약 2,000~3,000건)
    pub max_transactions_per_block: usize,
}

impl ChainConfig {
    // ============================================================
    // 프리셋 1: 비트코인 실제 값
    // ============================================================
    // 실제 비트코인과 동일한 파라미터.
    // 교육용으로 "진짜 비트코인은 이 값이다"를 보여줄 때 사용.
    // 단, 이 설정으로 실행하면 난이도가 너무 낮아서(1) 금방 올라간다.
    pub fn bitcoin() -> Self {
        ChainConfig {
            initial_difficulty: 1,
            adjustment_interval: 2016,
            target_time_per_block: 600,
            initial_block_reward: 50.0,
            halving_interval: 210_000,
            max_transactions_per_block: 3000,
        }
    }

    // ============================================================
    // 프리셋 2: 교육용 (빠르게 체험)
    // ============================================================
    // 값을 축소해서 몇 초 안에 난이도 조정, 반감기 등을 체험할 수 있다.
    pub fn educational() -> Self {
        ChainConfig {
            initial_difficulty: 2,
            adjustment_interval: 4,
            target_time_per_block: 3,
            initial_block_reward: 50.0,
            halving_interval: 10,
            max_transactions_per_block: 10,
        }
    }

    // ============================================================
    // 프리셋 3: 커스텀 (직접 설정)
    // ============================================================
    // 모든 값을 직접 지정할 수 있다.
    // 나중에 프론트엔드 슬라이더와 연결할 때 사용.
    pub fn custom(
        initial_difficulty: usize,
        adjustment_interval: u64,
        target_time_per_block: u64,
        initial_block_reward: f64,
        halving_interval: u64,
        max_transactions_per_block: usize,
    ) -> Self {
        ChainConfig {
            initial_difficulty,
            adjustment_interval,
            target_time_per_block,
            initial_block_reward,
            halving_interval,
            max_transactions_per_block,
        }
    }

    // 설정값을 보기 좋게 출력
    pub fn print_config(&self) {
        println!("  ┌─ [ChainConfig] ───────────────────────────┐");
        println!("  │  초기 난이도:        {}", self.initial_difficulty);
        println!("  │  난이도 조정 주기:   {}블록마다", self.adjustment_interval);
        println!("  │  블록당 목표 시간:   {}초", self.target_time_per_block);
        println!("  │  초기 채굴 보상:     {} BTC", self.initial_block_reward);
        println!("  │  반감기 주기:        {}블록마다", self.halving_interval);
        println!("  │  블록당 최대 거래:   {}건", self.max_transactions_per_block);
        println!("  └───────────────────────────────────────────┘");
    }
}
