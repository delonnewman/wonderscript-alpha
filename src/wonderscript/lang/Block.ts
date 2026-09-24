import { Symbol } from "./Symbol";
import { Message } from "./Message";
import { Script } from "./Dispatch";
import { Context } from "./Context";

export class Block extends Script implements Message {
  #params: Symbol[] = [];
  #context: Context;

  constructor(params: Symbol[], ctx: Context) {
    super();
    this.#params = params;
    this.#context = ctx;
  }

  get params() {
    return Array.from(this.#params);
  }

  get arity() {
    return this.#params.length;
  }

  get interned() {
    return `block_${this.arity}`;
  }

  call(...args: unknown[]) {
    if (args.length !== this.arity) {
      throw new Error(
        `wrong number of arguments expected ${this.arity}, but got ${args.length}`
      );
    }

    const params = this.params;
    for (let i = 0; i < params.length; i++) {
      this.#context.define(params[i], args[i]);
    }

    return this.dispatch(this.#context);
  }
}