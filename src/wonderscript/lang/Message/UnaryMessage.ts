import { BaseMessage } from "./BaseMessage";
import { MessageArgs, MessageForm, Obj } from "../Message";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emit } from "../../compiler/emit";
import { jsEval } from "../../compiler/jsEval";
import { Symbol } from "../Symbol";
import { Keyword } from "../Keyword";
import { Vector } from "../Vector";

const EMPTY_ARRAY = Object.freeze([]);

export class UnaryMessage extends BaseMessage {
  static parse(msg: MessageForm): UnaryMessage {
    if (msg instanceof Symbol || msg instanceof Keyword) {
      return new this(msg.name, msg.namespace);
    }

    if (typeof msg === "string") {
      return new this(msg);
    }

    throw new Error(`invalid unary message: ${msg}`);
  }

  get interned(): string {
    return this.name;
  }

  get arity(): number {
    return 0;
  }

  get args(): MessageArgs {
    return EMPTY_ARRAY;
  }

  sendTo(obj: Form): unknown {
    return jsEval(this.toJS(new Context(), obj));
  }

  toJS(ctx: Context, obj: Form): string {
    return `${this.interned}${emit(obj, ctx)}`;
  }
}