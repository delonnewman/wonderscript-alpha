import { Message } from "./Message";
import { Dispatch } from "./Dispatch";
import { ObjectPool } from "./ObjectPool";
import { Context } from "./Context";

export class Method {
  readonly message: Message;
  #dispatch: Dispatch;

  constructor(message: Message, dispatch: Dispatch) {
    this.message = message;
    this.#dispatch = dispatch;
  }

  bindings(msg: Message) {
    return this.message.bindings(msg);
  }

  dispatch(pool: ObjectPool, ctx: Context): unknown {
    return this.#dispatch.dispatch(pool, ctx);
  }
}