import { Symbol } from "../Symbol";
import { ObjectPool, ObjectValue } from "../ObjectPool";
import { Context } from "../Context";
import { Dispatch, isDispatch } from "../Dispatch";

export class Binding implements Dispatch {
  #name: Symbol;
  #action: Dispatch | ObjectValue;

  constructor(name: Symbol, action: Dispatch | ObjectValue) {
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
    if (isDispatch(this.#action)) {
      return this.#action.dispatch(pool, ctx);
    } else {
      return this.#action;
    }
  }
}
