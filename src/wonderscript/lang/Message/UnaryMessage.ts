import { BaseMessage } from "./BaseMessage";
import { MessageArgs, Obj } from "../Message";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emit } from "../../compiler/emit";

const EMPTY_ARRAY = Object.freeze([]);

export class UnaryMessage extends BaseMessage {
  get arity(): number {
    return 0;
  }

  get args(): MessageArgs {
    return EMPTY_ARRAY;
  }

  sendTo(obj: Obj): unknown {
    return obj[this.interned];
  }

  toJS(ctx: Context, obj: Form): string {
    return `${emit(obj, ctx)}.${this.interned}`;
  }
}