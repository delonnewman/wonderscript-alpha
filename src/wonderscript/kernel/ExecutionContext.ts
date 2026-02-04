import { Transmission } from "./Transmission";

type Args = {
  parent?: ExecutionContext,
  transmissions?: Transmission[],
  pausedAt?: number,
};

export class ExecutionContext {
  #parent?: ExecutionContext;
  #paused: number | undefined;
  #running: boolean;
  #pauseRequest: boolean;
  #transmissions: Transmission[];

  constructor({ parent, transmissions, pausedAt }: Args = {}) {
    this.#parent = parent;
    this.#paused = pausedAt;
    this.#running = false;
    this.#pauseRequest = false;
    this.#transmissions = transmissions ?? [];
  }

  get parent() { return this.#parent }
  get paused() { return this.#paused !== undefined }
  get pausedAt() { return this.#paused }
  get running() { return this.#running }

  addTransmission(tx: Transmission) {
    this.#transmissions.push(tx);
    return this;
  }

  forEach(fn: (tx: Transmission, ctx: ExecutionContext) => void) {
    for (const tx of this.#transmissions) {
      fn(tx, this);
    }
  }

  resume() {
    this.resumeAt(this.pausedAt);
  }

  execute() {
    return this.resumeAt(0);
  }

  pause() {
    this.#pauseRequest = true;
  }

  validateIndex(index) {
    if (index > (this.#transmissions.length - 1)) {
      throw new Error(`invalid statement index: ${index}`);
    }
  }

  resumeAt(index: number) {
    this.validateIndex(index);
    const txs = this.#transmissions;

    this.#running = true;
    this.#paused = undefined;

    let result: unknown;
    for (let i = index; i < txs.length; i++) {
      if (this.#pauseRequest) {
        this.pauseAt(i);
        break;
      }
      result = txs[i].execute();
    }
    this.#running = false;

    return result;
  }

  pauseAt(index: number) {
    this.validateIndex(index);
    this.#paused = index;
    this.#running = false;
  }
}
