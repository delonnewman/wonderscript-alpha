import { BaseMessage } from "./BaseMessage";
import {
  CompoundMessageForm,
  Message,
  MessageArgs,
  MessageFlags,
} from "../Message";
import { Form } from "../../compiler/core";
import { jsEval } from "../../compiler/jsEval";
import { Context } from "../Context";
import { emit } from "../../compiler/emit";
import { Keyword } from "../Keyword";
import { Symbol } from "../Symbol";
import { Dispatch, isDispatch } from "../Dispatch";
import { ObjectPool } from "../ObjectPool";

export class BinaryMessage extends BaseMessage implements Dispatch {
  static jsOp(name: string, other: Form) {
    return new this(name, "js", other);
  }

  static parse(msg: CompoundMessageForm): BinaryMessage {
    const [tag, other] = msg;

    let name: string, ns: string | undefined;
    if (tag instanceof Keyword || tag instanceof Symbol) {
      name = tag.name;
      ns = tag.namespace;
    } else {
      name = tag;
    }

    return new this(name, ns, other);
  }

  #other: Form | Dispatch;

  constructor(
    name: string,
    namespace: string | undefined,
    other: Form | Dispatch,
    flags: MessageFlags = {}
  ) {
    super(name, namespace, flags);
    this.#other = other;
  }

  get interned(): string {
    return this.name;
  }

  get other() {
    return this.#other;
  }

  get arity(): number {
    return 1;
  }

  get args(): MessageArgs {
    return [this.#other];
  }

  toString(): string {
    return `(${this.interned} ${this.#other})`;
  }

  sendTo(obj: Form): unknown {
    return jsEval(this.toJS(new Context(), obj));
  }

  dispatch(pool: ObjectPool, ctx: Context): Message {
    if (isDispatch(this.other)) {
      const other = this.other.dispatch(pool, ctx) as Form;
      return new (this.constructor as typeof BinaryMessage)(
        this.name,
        this.namespace,
        other,
        { withinQuery: this.isWithinQuery()}
      );
    }

    return this;
  }

  toJS(ctx: Context, obj: Form): string {
    if (isDispatch(this.other)) {
      throw new Error(`cannot emit dispatch in binary message: ${this}`);
    }
    return `(${emit(obj, ctx)}${this.interned}${emit(this.other, ctx)})`;
  }
}