import { MessageForm } from "../Message";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { UnaryMessage } from "../Message/UnaryMessage";
import { emit } from "../../compiler/emit";

export class JSTypeMessage extends UnaryMessage {
  static INSTANCE = new JSTypeMessage("typeof", "js");

  static parse(_: MessageForm) {
    return this.INSTANCE;
  }

  sendTo(obj: Record<string, unknown>): unknown {
    return typeof obj;
  }

  toJS(ctx: Context, obj: Form): string {
    return `typeof ${emit(obj, ctx)}`;
  }
}
