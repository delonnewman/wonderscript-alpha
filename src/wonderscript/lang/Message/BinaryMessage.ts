import { BaseMessage } from "./BaseMessage";
import {
  CompoundMessageForm,
  MessageArgs,
  MessageFlags,
  MessageForm,
  Obj,
} from "../Message";
import { Form } from "../../compiler/core";
import { jsEval } from "../../compiler/jsEval";
import { Context } from "../Context";
import { emit } from "../../compiler/emit";
import { Keyword } from "../Keyword";
import { Symbol } from "../Symbol";
import { pt } from "../../util";

export class BinaryMessage extends BaseMessage {
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

  #other: Form;

  constructor(
    name: string,
    namespace: string | undefined,
    other: Form,
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

  sendTo(obj: Form): unknown {
    return jsEval(this.toJS(new Context(), obj));
  }

  toJS(ctx: Context, obj: Form): string {
    return `(${emit(obj, ctx)}${this.interned}${emit(this.other, ctx)})`;
  }
}