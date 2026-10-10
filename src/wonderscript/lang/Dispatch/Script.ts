import { Dispatch, SequentialDispatch } from "../Dispatch";
import { Binding } from "./Binding";
import { ObjectPool, ObjectValue } from "../ObjectPool";
import { Context } from "../Context";
import { Symbol } from "../Symbol";
import { Meta, MetaData } from "../Meta";
import { merge } from "../merge";

export class Script implements SequentialDispatch, Meta {
  #actions: Dispatch[];
  #bindings: Binding[];
  #result: unknown;
  #meta: MetaData | undefined;

  constructor(actions: Dispatch[] = [], bindings: Binding[] = [], meta?: MetaData) {
    this.#actions = actions;
    this.#bindings = bindings;
    this.#meta = meta;
  }

  meta() {
    return this.#meta;
  }

  hasMeta(): boolean {
    return this.#meta != null && this.#meta.size > 0;
  }

  withMeta(data: MetaData): Script {
    return new Script(this.#actions, this.#bindings, merge(this.#meta, data));
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

  bind(name: Symbol, action: Dispatch | ObjectValue) {
    this.#bindings.push(new Binding(name, action));
    return this;
  }

  then(action: Dispatch): Script {
    this.#actions.push(action);
    return this;
  }

  dispatch(pool: ObjectPool, ctx: Context) {
    for (const binding of this.#bindings) {
      ctx.define(binding.name, binding.dispatch(pool, ctx));
    }
    for (const action of this.#actions.slice(0, this.#actions.length - 1)) {
      action.dispatch(pool, ctx);
    }
    const result = this.#actions[this.#actions.length - 1].dispatch(pool, ctx);
    this.#result = result;
    return result;
  }
}
