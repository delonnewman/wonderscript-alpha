import { UnaryMessage } from "../Message/UnaryMessage";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emit } from "../../compiler/emit";
import { jsEval } from "../../compiler/jsEval";

export class JSPrefixMessage extends UnaryMessage {
  sendTo(obj: Form): unknown {
    return jsEval(this.toJS(new Context(), obj));
  }

  toJS(ctx: Context, obj: Form): string {
    return `${this.name}${emit(obj, ctx)}`;
  }
}