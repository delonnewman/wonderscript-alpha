import { SequentialDispatch } from "../Dispatch";
import { Action } from "./Action";
import { Binding } from "./Binding";
import { ObjectPool } from "../ObjectPool";
import { Context } from "../Context";
import { Symbol } from "../Symbol";

export class Script implements SequentialDispatch {
  #actions: Action[];
  #bindings: Binding[];
  #result: unknown;

  constructor(actions: Action[] = [], bindings: Binding[] = []) {
    this.#actions = actions;
    this.#bindings = bindings;
  }

  get result() {
    return this.#result;
  }

  get actions() {
    return Array.from(this.#actions);
  }

  get bindings() {
    return Array.from(this.#bindings);
  }

  bind(name: Symbol, action: Action) {
    this.#bindings.push(new Binding(name, action));
    return this;
  }

  then(action: Action) {
    this.#actions.push(action);
    return this;
  }

  dispatch(pool: ObjectPool, ctx: Context) {
    for (const binding of this.#bindings) {
      ctx.define(binding.name, binding.action.dispatch(pool, ctx));
    }
    for (const action of this.#actions.slice(0, this.#actions.length - 1)) {
      action.dispatch(pool, ctx);
    }
    this.#result = this.#actions[this.#actions.length - 1].dispatch(pool, ctx);
    return this;
  }
}
