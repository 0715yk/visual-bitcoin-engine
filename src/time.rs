// ============================================================
// time.rs — "지금 몇 초인가?"를 플랫폼별로 다르게 구한다
// ============================================================
// 비트코인 블록에는 생성 시각(timestamp)이 들어간다.
// 그런데 시간을 구하는 방법이 실행 환경마다 다르다:
//
//   - 네이티브(CLI): 운영체제의 시계 → std::time::SystemTime
//   - 브라우저(WASM): 운영체제가 없다! → JavaScript의 Date.now()
//
// wasm32 타겟에서 SystemTime::now()를 호출하면 런타임 패닉이 난다.
// 그래서 #[cfg(...)]로 "어느 환경에서 컴파일되는지"에 따라
// 서로 다른 구현을 골라 쓴다. (조건부 컴파일)

// --- 네이티브(터미널) 환경 ---
#[cfg(not(target_arch = "wasm32"))]
pub fn now_secs() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_secs()
}

// --- 브라우저(WASM) 환경 ---
// JavaScript의 Date.now()는 밀리초(ms)를 주므로 1000으로 나눠 초로 바꾼다.
#[cfg(target_arch = "wasm32")]
pub fn now_secs() -> u64 {
    (js_sys::Date::now() / 1000.0) as u64
}
