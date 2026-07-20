# Visual Bitcoin Engine

**Learn how Bitcoin actually works by touching it.**
An interactive, browser-based simulator where the real cryptography — SHA-256 hashing, proof-of-work mining, secp256k1 ECDSA signing, P2P consensus, and attack simulations — runs live in your browser.

🌐 **Live:** https://howbitcoinworks.dev

The twist: the engine is **not** faked in JavaScript. It's written in **Rust** and compiled to **WebAssembly**, so the exact same engine that runs on the CLI (`cargo run`) runs inside your browser. JavaScript only draws the picture.

---

## What you can explore

The site walks through Bitcoin one component at a time, across 8 interactive tabs:

1. **SHA-256** — Turn any input into a 64-hex-digit fingerprint and watch the avalanche effect (change one character, half the bits flip).
2. **Mining (PoW)** — Brute-force a nonce until the hash starts with N zeros, and feel why difficulty scales exponentially.
3. **Blockchain simulator** — Create transactions, mine blocks, tamper with history, and get caught by chain validation.
4. **UTXO & digital signatures** — See coins as unspent outputs locked to addresses, unlocked only by a real secp256k1 signature. Try (and fail) to forge someone else's coin.
5. **Block anatomy** — Build a Merkle tree, assemble an 80-byte header, and mine with **double SHA-256** against a real `target`, down to the hex.
6. **P2P consensus** — Run multiple nodes, create forks, broadcast, and watch reorgs converge on the longest valid chain.
7. **Double-spend / 51% attack** — Race a secret chain against the honest one, with an actual success-probability calculator.
8. **Quantum threat** — Shor vs. Grover: what's a real risk to signatures, what's overhyped for hashing.

Available in **Korean, English, Japanese, Spanish, French, and German**.

---

## Why WebAssembly?

Browsers can't run Rust directly — only JavaScript and WebAssembly. By compiling the Rust engine to WASM, the "real engine" runs in the browser exactly as it does natively. Every calculation you see on screen (hashing, mining, ECDSA sign/verify, consensus, attacks) is done by the Rust code in `src/`.

---

## Source structure

| File | Responsibility |
|------|----------------|
| `src/block.rs` | Block hashing & mining |
| `src/transaction.rs` | Transactions |
| `src/blockchain.rs` | Chain, balances, validation |
| `src/utxo.rs` | UTXO model, per-input signing |
| `src/wallet.rs` | Keys & ECDSA (CLI account-model demo) |
| `src/merkle.rs` | Merkle tree |
| `src/header.rs` | 80-byte block header |
| `src/network.rs` | P2P consensus |
| `src/attack.rs` | Double-spend / 51% attack |
| `src/wasm_api.rs` | Browser bridge (wasm-bindgen) |
| `src/main.rs` | CLI entry point |

---

## Tech stack

- **Rust** (edition 2024) — the engine
- **WebAssembly** via `wasm-bindgen` — the browser runtime
- [`sha2`](https://crates.io/crates/sha2) — SHA-256
- [`k256`](https://crates.io/crates/k256) — secp256k1 ECDSA (the same curve Bitcoin uses)
- [`serde`](https://crates.io/crates/serde) — engine → JS serialization
- Vanilla JS + CSS for the UI (no framework)

---

## Run locally

### Prerequisites
- [Rust](https://rustup.rs/) with the `wasm32-unknown-unknown` target:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```
- [`wasm-bindgen-cli`](https://crates.io/crates/wasm-bindgen-cli):
  ```bash
  cargo install wasm-bindgen-cli
  ```
- Python 3 (for the local static server)

### Build the WASM engine
```bash
bash build-wasm.sh
```
This compiles `src/` to `wasm32-unknown-unknown` and generates `web/pkg/` (`.wasm` + JS glue).

### Serve the site
```bash
bash serve.sh
# then open http://localhost:8000
```
> `.wasm` must be served over `http://` (not `file://`), which is why a local server is needed.

### Run the CLI version (optional)
```bash
cargo run
```
The same engine, in your terminal.

---

## Deployment

Static site hosted on Vercel. `web/` is the output directory; `web/pkg/` (the built WASM) is committed so no build step is required on deploy. See `vercel.json`.

---

## Contact

Built by **0715yk** — [yongkiniiii@gmail.com](mailto:yongkiniiii@gmail.com)

Feedback and corrections welcome — especially on technical accuracy. Open an issue on GitHub.
