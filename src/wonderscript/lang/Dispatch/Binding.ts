import { Action } from "./Action";
import { Symbol } from "../Symbol";
import { ObjectPool, ObjectValue } from "../ObjectPool";
import { Context } from "../Context";
import { Dispatch } from "../Dispatch";

export class Binding implements Dispatch {
  #name: Symbol;
  #action: Action | ObjectValue;

  constructor(name: Symbol, action: Action | ObjectValue) {
    this.#name = name;
    this.#action = action;
  }

  get action() {
    return this.#action;
  }

  get name() {
    return this.#name;
  }

  dispatch(pool: ObjectPool, ctx: Context) {
    if (this.#action instanceof Action) {
      return this.#action.dispatch(pool, ctx);
    } else {
      return this.#action;
    }
  }
}

