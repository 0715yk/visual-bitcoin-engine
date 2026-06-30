#!/usr/bin/env bash
# ============================================================
# serve.sh — web/ 폴더를 로컬 HTTP 서버로 띄운다
# ============================================================
# WebAssembly(.wasm)는 file:// 로는 못 열고 http:// 로 받아야 한다.
# 그래서 간단한 로컬 서버가 필요하다. (외부에 노출되지 않음)
#
# 사용법:  bash serve.sh   →  브라우저에서 http://localhost:8000
PORT="${PORT:-8000}"
cd "$(dirname "$0")/web"
echo "▶ http://localhost:$PORT  (종료: Ctrl+C)"
python -m http.server "$PORT"
