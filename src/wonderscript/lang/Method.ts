import { EMPTY_ARRAY, Message } from "./Message";
import { Binding, Dispatch } from "./Dispatch";
import { ObjectPool } from "./ObjectPool";
import { Context } from "./Context";
import { ArgListMessage } from "./Message/ArgListMessage";
import { UnaryMessage } from "./Message/UnaryMessage";
import { prStr } from "../compiler/prStr";
import { Symbol } from "./Symbol";
import { pt } from "../util";
import { BinaryMessage } from "./Message/BinaryMessage";

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

interface Constructor {
  (...args: any[]): void;
}

export const JSMethod = {
  bind(obj: Object, method: Function, msg: ArgListMessage | UnaryMessage): IMethod {
    const args = msg.args;
    const bound = method.bind(obj, ...args);
    Object.assign(bound, JSMethodMixin);
    return bound;
  },

  messages(obj: Object) {
    const messages: Message[] = [];
    const props = Object.getOwnPropertyNames(obj);
    props.push(...Object.getOwnPropertyNames(Object.getPrototypeOf(obj)));

    for (const prop of props) {
      if (typeof obj[prop] === "function") {
        messages.push(
          new ArgListMessage(prop, undefined, [Symbol.intern("&args")])
        );
      } else {
        messages.push(new UnaryMessage(prop));
      }
    }

    return messages;
  },

  initMethod(ctr: Function, msg: ArgListMessage | BinaryMessage | UnaryMessage) {
    const method = function () {
      return new (ctr as Constructor)()
    };
    const bound = method.bind(ctr, ...msg.args);

    Object.assign(bound, JSMethodMixin);
    return bound;
  },

  findMethod(obj: Object, msg: Message): IMethod | undefined {
    if (msg instanceof ArgListMessage || msg instanceof BinaryMessage) {
      if (msg.name in obj && typeof (obj as any)[msg.name] === "function") {
        return this.bind(obj, (obj as any)[msg.name], msg);
      }

      if (typeof obj === "function" && msg.name === "new") {
        return this.initMethod(obj, msg);
      }
    }

    if (msg instanceof UnaryMessage) {
      if (msg.name in obj) {
        if (typeof (obj as any)[msg.name] === "function") {
          return this.bind(obj, (obj as any)[msg.name], msg);
        }

        const self = obj;
        const method = function () {
          return (self as any)[msg.name];
        };

        return this.bind(obj, method, msg);
      }

      if (msg.name === "inspect") {
        return this.bind(obj, obj.toString, msg);
      }

      if (msg.name === "class") {
        const method = function() {
          return Object.getPrototypeOf(this).constructor
        };
        const bound = method.bind(obj);
        Object.assign(bound, JSMethodMixin);
        return bound;
      }

      if (msg.name === "messages") {
        const bound = this.messages.bind(this, obj);
        Object.assign(bound, JSMethodMixin);
        return bound;
      }

      if (typeof obj === "function" && msg.name === "new") {
        return this.initMethod(obj, msg);
      }
    }

    throw new Error(`unknown method ${prStr(msg)} for ${obj}`);
  },
}