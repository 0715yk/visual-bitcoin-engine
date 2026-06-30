// ============================================================
// lib.rs — 라이브러리 크레이트의 진입점
// ============================================================
// 이전에는 main.rs가 모든 모듈(mod block; ...)을 직접 들고 있었지만,
// 이제 엔진 로직을 "라이브러리"로 분리한다.
//
// 이렇게 하면 같은 엔진 코드를 두 곳에서 재사용할 수 있다:
//   1. CLI 바이너리 (main.rs)  → 터미널에서 실행
//   2. WebAssembly (wasm_api)  → 브라우저에서 실행
//
// 즉, "진짜 Rust 엔진"이 그대로 브라우저 안에서 돌아간다.

pub mod block;
pub mod blockchain;
pub mod config;
pub mod header;
pub mod merkle;
pub mod time;
pub mod transaction;
pub mod utxo;

// 브라우저(wasm) 타겟으로 컴파일할 때만 WASM 바인딩을 포함한다.
// 네이티브(CLI) 빌드에서는 이 모듈이 통째로 제외되므로
// wasm-bindgen 같은 의존성이 필요 없다.
#[cfg(target_arch = "wasm32")]
pub mod wasm_api;
