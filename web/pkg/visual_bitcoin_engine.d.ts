/* tslint:disable */
/* eslint-disable */

export class WasmDoubleSpend {
    free(): void;
    [Symbol.dispose](): void;
    attacker_mine(): string;
    honest_mine(): string;
    constructor(difficulty: number, required_conf: number);
    reveal(): string;
    snapshot(): string;
    start_payment(): string;
    take_logs(): string;
}

export class WasmEngine {
    free(): void;
    [Symbol.dispose](): void;
    add_transaction(from: string, to: string, amount: number): boolean;
    begin_mine(miner: string): string;
    is_mining(): boolean;
    mine_step(batch: bigint): string;
    constructor(initial_difficulty: number, adjustment_interval: bigint, target_time_per_block: bigint, initial_block_reward: number, halving_interval: bigint, max_transactions_per_block: number);
    snapshot(): string;
    take_logs(): string;
    tamper(block_index: number, tx_index: number, new_to: string, new_amount: number): boolean;
    tamper_rehash(block_index: number, tx_index: number, new_to: string, new_amount: number): boolean;
    validate(): string;
}

export class WasmHeaderMiner {
    free(): void;
    [Symbol.dispose](): void;
    info(): string;
    constructor(prev_hash_hex: string, txs_json: string, zero_bits: number);
    step(batch: number): string;
}

export class WasmNetwork {
    free(): void;
    [Symbol.dispose](): void;
    broadcast(from: number): string;
    mine_on(idx: number): string;
    constructor(names_json: string, difficulty: number);
    snapshot(): string;
    take_logs(): string;
}

export class WasmUtxo {
    free(): void;
    [Symbol.dispose](): void;
    forge(attacker: string, victim: string, to: string, amount: number): string;
    fund(address: string, amount: number): string;
    constructor();
    send(from: string, to: string, amount: number, fee: number): string;
    snapshot(): string;
    take_logs(): string;
}

export function dsha256_steps(input: string): string;

export function merkle_tree(txs_json: string): string;

export function pow_preimage(data: string, nonce: bigint): string;

export function pow_try(data: string, difficulty: number, start_nonce: bigint, batch: bigint): string;

export function sha256(input: string): string;

export function start(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_wasmdoublespend_free: (a: number, b: number) => void;
    readonly __wbg_wasmengine_free: (a: number, b: number) => void;
    readonly __wbg_wasmheaderminer_free: (a: number, b: number) => void;
    readonly __wbg_wasmnetwork_free: (a: number, b: number) => void;
    readonly __wbg_wasmutxo_free: (a: number, b: number) => void;
    readonly dsha256_steps: (a: number, b: number) => [number, number];
    readonly merkle_tree: (a: number, b: number) => [number, number];
    readonly pow_preimage: (a: number, b: number, c: bigint) => [number, number];
    readonly pow_try: (a: number, b: number, c: number, d: bigint, e: bigint) => [number, number];
    readonly sha256: (a: number, b: number) => [number, number];
    readonly wasmdoublespend_attacker_mine: (a: number) => [number, number];
    readonly wasmdoublespend_honest_mine: (a: number) => [number, number];
    readonly wasmdoublespend_new: (a: number, b: number) => number;
    readonly wasmdoublespend_reveal: (a: number) => [number, number];
    readonly wasmdoublespend_snapshot: (a: number) => [number, number];
    readonly wasmdoublespend_start_payment: (a: number) => [number, number];
    readonly wasmdoublespend_take_logs: (a: number) => [number, number];
    readonly wasmengine_add_transaction: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly wasmengine_begin_mine: (a: number, b: number, c: number) => [number, number];
    readonly wasmengine_is_mining: (a: number) => number;
    readonly wasmengine_mine_step: (a: number, b: bigint) => [number, number];
    readonly wasmengine_new: (a: number, b: bigint, c: bigint, d: number, e: bigint, f: number) => number;
    readonly wasmengine_snapshot: (a: number) => [number, number];
    readonly wasmengine_take_logs: (a: number) => [number, number];
    readonly wasmengine_tamper: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly wasmengine_tamper_rehash: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly wasmengine_validate: (a: number) => [number, number];
    readonly wasmheaderminer_info: (a: number) => [number, number];
    readonly wasmheaderminer_new: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly wasmheaderminer_step: (a: number, b: number) => [number, number];
    readonly wasmnetwork_broadcast: (a: number, b: number) => [number, number];
    readonly wasmnetwork_mine_on: (a: number, b: number) => [number, number];
    readonly wasmnetwork_new: (a: number, b: number, c: number) => number;
    readonly wasmnetwork_snapshot: (a: number) => [number, number];
    readonly wasmnetwork_take_logs: (a: number) => [number, number];
    readonly wasmutxo_forge: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly wasmutxo_fund: (a: number, b: number, c: number, d: number) => [number, number];
    readonly wasmutxo_new: () => number;
    readonly wasmutxo_send: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly wasmutxo_snapshot: (a: number) => [number, number];
    readonly wasmutxo_take_logs: (a: number) => [number, number];
    readonly start: () => void;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
