# Visual Bitcoin Engine

**Learn how Bitcoin — and Ethereum PoS — actually work by touching them.**
An interactive, browser-based simulator where the real cryptography and consensus logic run live in your browser (Rust → WebAssembly). Use the **Bitcoin | Ethereum** switcher in the header (`?chain=btc|eth`).

🌐 **Live:** https://howbitcoinworks.dev

The twist: the engine is **not** faked in JavaScript. It's written in **Rust** and compiled to **WebAssembly**, so the exact same engine that runs on the CLI (`cargo run`) runs inside your browser. JavaScript only draws the picture.

---

## What you can explore

### Bitcoin (8 tabs)

1. **SHA-256** — Turn any input into a 64-hex-digit fingerprint and watch the avalanche effect (change one character, half the bits flip).
2. **Mining (PoW)** — Brute-force a nonce until the hash starts with N zeros, and feel why difficulty scales exponentially.
3. **Blockchain simulator** — Create transactions, mine blocks, tamper with history, and get caught by chain validation.
4. **UTXO & digital signatures** — See coins as unspent outputs locked to addresses, unlocked only by a real secp256k1 signature. Try (and fail) to forge someone else's coin.
5. **Block anatomy** — Build a Merkle tree, assemble an 80-byte header, and mine with **double SHA-256** against a real `target`, down to the hex.
6. **P2P consensus** — Run multiple nodes, create forks, broadcast, and watch reorgs converge on the longest valid chain.
7. **Double-spend / 51% attack** — Race a secret chain against the honest one, with an actual success-probability calculator.
8. **Quantum threat** — Shor vs. Grover: what's a real risk to signatures, what's overhyped for hashing.

### Visual Ethereum Engine (6 tabs)

Smart-contract-first. The Rust engine executes "canned" contracts (no full EVM bytecode), but follows real rules: CREATE addresses = `keccak(deployer, nonce)`, real event `topic0` hashes, gas charged even on revert, EIP-1559 burn + tip. The UI shows the actual **Solidity source** and highlights the function you just called.

1. **Overview** — Bitcoin = ledger of money vs Ethereum = ledger that runs code.
2. **Accounts · Gas** — balance, nonce, EIP-1559 (burn / tip / value split), Keccak-256 addresses & function selectors.
3. **Smart Contracts** — deploy a Solidity vending machine, call `buy()` / `withdraw()`, watch storage, events, gas receipts, and reverts.
4. **Tokens (ERC-20)** — a token is just a contract's `mapping(address → balance)`; `Transfer` topic0 matches mainnet.
5. **Oracles** — chains can't see the world: multi-node Chainlink-style price feed (median) + a price-insurance contract that consumes it.
6. **PoS Consensus** — The Merge, validators staking 32 ETH, slots → 2/3 finality, slashing, fork attacks (Gasper-lite, not Beacon-spec).

Available in **Korean, English, Japanese, Spanish, French, and German** (ETH UI copy: ko/en first; other langs fall back to Korean).

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
| `src/eth/` | Ethereum engine (accounts, canned smart contracts, oracle feed, staking, Gasper-lite, Keccak) |
| `src/wasm_api.rs` | Browser bridge (wasm-bindgen) — `WasmEngine` + `WasmEth` |
| `web/eth/` | Ethereum tab UI (`eth-app.js`, `eth-i18n.js`, `eth-solidity.js` — displayed Solidity sources) |
| `src/main.rs` | CLI entry point |

---

## Tech stack

- **Rust** (edition 2024) — the engine
- **WebAssembly** via `wasm-bindgen` — the browser runtime
- [`sha2`](https://crates.io/crates/sha2) — SHA-256
- [`sha3`](https://crates.io/crates/sha3) — Keccak-256 (Ethereum addresses / hashes)
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
