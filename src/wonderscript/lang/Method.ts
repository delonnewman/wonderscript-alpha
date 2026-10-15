import { EMPTY_ARRAY, Message } from "./Message";
import { Binding, Dispatch } from "./Dispatch";
import { ObjectPool, ObjectValue } from "./ObjectPool";
import { Context } from "./Context";
import { ArgListMessage } from "./Message/ArgListMessage";

export interface MethodTable {
  get interned(): string; // for method caching
  findMethod(msg: Message): IMethod;
}

export type IMethod = {
  bindings(msg: Message): readonly Binding[];
  dispatch(pool: ObjectPool, ctx: Context): unknown;
}

export class Method implements IMethod {
  readonly message: Message;
  #dispatch: Dispatch;

  constructor(message: Message, dispatch: Dispatch) {
    this.message = message;
    this.#dispatch = dispatch;
  }

  bindings(msg: Message): readonly Binding[] {
    return this.message.bindings(msg);
  }

  dispatch(pool: ObjectPool, ctx: Context): unknown {
    return this.#dispatch.dispatch(pool, ctx);
  }

  toString() {
    return `#<Method ${this.message} => ${this.#dispatch}>`;
  }
}

/**
 * A mixin for bound JavaScript Methods so that they can function as WS Methods
 */
const JSMethodMixin: IMethod = {
  bindings(_msg: Message): readonly Binding[] {
    return EMPTY_ARRAY;
  },
  dispatch(_pool: ObjectPool, _ctx: Context): unknown {
    return this();
  }
};

export const JSMethod = {
  bind(obj: ObjectValue, method: Function, msg: ArgListMessage): IMethod {
    const args = msg.args;
    const bound = method.bind(obj, ...args);
    Object.assign(bound, JSMethodMixin);
    return bound;
  }
}

export const JSClassMixin: MethodTable = {
  get interned(): string {
    return this.name;
  },
  findMethod(msg: Message): IMethod {
    if (msg instanceof ArgListMessage) {
      const method = (this as any).prototype[msg.name];
      if (typeof method === 'function') {
        return JSMethod.bind(this, method, msg);
      }
    }

    throw new Error(`unknown method ${msg} for an instance of ${this}`);
  }
};