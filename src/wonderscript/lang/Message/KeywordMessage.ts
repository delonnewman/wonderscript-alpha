import { BaseMessage } from "./BaseMessage";
import { MessageFlags } from "../Message";
import { escapeChars } from "../../compiler/utils";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emit } from "../../compiler/emit";

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

  get args(): KeywordArgs {
    return this.#args;
  }

  get arity(): number {
    return this.args.size;
  }

  sendTo(obj: unknown): unknown {
    const fn = obj[this.interned];
    if (typeof fn === "function") {
      return fn.call(obj, this.args);
    }

    throw new Error(`unknown message ${this}`);
  }

  toJS(ctx: Context, obj: Form): string {
    const args = Array.from(this.args.entries()).map(([key, value]) => (
      `[${emit(key, ctx)}, ${emit(value as Form, ctx)}]`
    ));
    return `${emit(obj, ctx)}.${this.interned}(new Map(${args.join(', ')}))`;
  }
}