import { BaseMessage } from "./BaseMessage";
import {
  CompoundMessageForm,
  EMPTY_ARRAY,
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
import { Binding, Dispatch, isDispatch } from "../Dispatch";
import { ObjectPool, ObjectValue } from "../ObjectPool";

export class BinaryMessage extends BaseMessage implements Dispatch {
  static jsOp(name: string, other: ObjectValue | Dispatch) {
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

  #other: ObjectValue | Dispatch;

  constructor(
    name: string,
    namespace: string | undefined,
    other: ObjectValue | Dispatch,
    flags: MessageFlags = {}
  ) {
    super(name, namespace, flags);
    this.#other = other;
  }

  get interned(): string {
    return `${this.name}_1`;
  }

  get internings(): string[] {
    return [this.interned];
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

  bindings(msg: BinaryMessage): readonly Binding[] {
    if (!(msg instanceof this.constructor)) {
      throw new Error(`invalid message for bindings: ${msg}`);
    }

    if (!(this.other instanceof Symbol)) {
      return EMPTY_ARRAY;
    }

    return Object.freeze([new Binding(this.other, msg.other)]);

  }

  sendTo(obj: unknown): unknown {
    return jsEval(this.toJS(new Context(), obj as Form));
  }

  dispatch(pool: ObjectPool, ctx: Context): Message {
    if (isDispatch(this.other)) {
      const other = this.other.dispatch(pool, ctx) as ObjectValue;
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