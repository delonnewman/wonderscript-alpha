import { MessageForm } from "../Message";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emit } from "../../compiler/emit";
import { ArgListMessage } from "../Message/ArgListMessage";

export class JSTypeMessage extends ArgListMessage {
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
