import { BaseMessage } from "./BaseMessage";
import { EMPTY_ARRAY, Message, MessageFlags } from "../Message";
import { escapeChars } from "../../compiler/utils";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emit } from "../../compiler/emit";
import { Binding } from "../Dispatch/Binding";
import { Symbol } from "../Symbol";
import { Dispatch } from "../Dispatch";
import { ObjectValue } from "../ObjectPool";

type KeywordArgs = Map<string, unknown>;
const EMPTY_MAP = Object.freeze(new Map());

export class KeywordMessage extends BaseMessage {
  #args: KeywordArgs;

  constructor(
    name: string,
    namespace: string,
    args?: KeywordArgs,
    flags: MessageFlags = {}
  ) {
    super(name, namespace, flags);
    this.#args = args ?? EMPTY_MAP;
  }

  get interned(): string {
    const buffer = [];
    for (let [key, value] of this.args.entries()) {
      buffer.push(escapeChars(key));
      if (value instanceof Symbol) {
        const valueStr = escapeChars(`${value}`);
        buffer.push(`_${valueStr}`);
      }
    }
    return `${buffer.join("_")}`;
  }

  get internings(): string[] {
    return [this.interned];
  }

  get args(): KeywordArgs {
    return this.#args;
  }

  get arity(): number {
    return this.args.size;
  }

  get keys(): unknown[] {
    return Array.from(this.args.keys());
  }

  get values(): unknown[] {
    return Array.from(this.args.values());
  }

  bindings(msg: Message): readonly Binding[] {
    if (!(msg instanceof KeywordMessage)) {
      throw new Error(`invalid message for bindings: ${msg}`);
    }

    const arity = this.arity;
    if (!(arity === 0)) {
      return EMPTY_ARRAY;
    }

    const keys = this.args.keys();
    const binds: Binding[] = [];
    for (let key of keys) {
      const name = this.args.get(key);
      const value = msg.args.get(key);
      if (name instanceof Symbol) {
        binds.push(new Binding(name, value as ObjectValue | Dispatch));
      }
    }

    return Object.freeze(binds);
  }

  sendTo(obj: unknown): unknown {
    const fn = obj[this.interned];
    if (typeof fn === "function") {
      return fn.call(obj, this.args);
    }

    throw new Error(`unknown message ${this}`);
  }

  toJS(ctx: Context, obj: Form): string {
    const args = Array.from(this.args.entries()).map(
      ([key, value]) => `[${emit(key, ctx)}, ${emit(value as Form, ctx)}]`
    );
    return `${emit(obj, ctx)}.${this.interned}(new Map(${args.join(", ")}))`;
  }
}