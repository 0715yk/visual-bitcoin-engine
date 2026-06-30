#!/usr/bin/env bash
# ============================================================
# build-wasm.sh — Rust 엔진을 WebAssembly로 빌드하고 JS 글루를 생성
# ============================================================
# src/ 의 Rust 코드를 고친 뒤 이 스크립트를 실행하면
# web/pkg/ 안의 .wasm + .js 가 새로 만들어진다.
#
# 사용법:  bash build-wasm.sh
set -e

# 이 PC에서는 MSVC C++ 빌드툴이 없어 GNU 툴체인으로 빌드한다.
# (rustup이 함께 설치한 자체 링커를 사용 → 별도 MinGW 불필요)
# 다른 환경이라면  TOOLCHAIN=stable  bash build-wasm.sh  처럼 덮어쓰면 된다.
TOOLCHAIN="${TOOLCHAIN:-stable-x86_64-pc-windows-gnu}"

echo "▶ 1/2  Rust → wasm32 (release) 빌드 ..."
cargo "+$TOOLCHAIN" build --lib --release --target wasm32-unknown-unknown

# 이 셸은 CARGO_TARGET_DIR가 따로 잡혀있을 수 있으므로 그걸 우선 사용
TARGET_DIR="${CARGO_TARGET_DIR:-target}"
WASM="$TARGET_DIR/wasm32-unknown-unknown/release/visual_bitcoin_engine.wasm"

echo "▶ 2/2  wasm-bindgen → web/pkg 생성 ..."
wasm-bindgen "$WASM" --out-dir web/pkg --target web

echo "✅ 완료 → web/pkg/"
echo "   이제  bash serve.sh  로 서버를 띄우고 http://localhost:8000 접속"
