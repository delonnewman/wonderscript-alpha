import { EMPTY_ARRAY, Message } from "./Message";
import { ObjectPool } from "./ObjectPool";
import { Context } from "./Context";

export class JSMethod {
  static CACHE: Record<string, JSMethod> = Object.create(null);

  static intern(msg: Message) {
    const key = msg.interned;
    let method = this.CACHE[key];
    if (method !== undefined) return method;

    method = this.CACHE[key] = new JSMethod(msg);
    return method;
  }

  constructor(msg: Message) {
  }

  bindings(msg: Message) {
    return EMPTY_ARRAY;
  }

  dispatch(pool: ObjectPool, ctx: Context): unknown {
    return
  }
}