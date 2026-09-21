import { UnaryMessage } from "./Message/UnaryMessage";
import { Context } from "./Context";
import { Form } from "../compiler/core";
import { emit } from "../compiler/emit";

export class JSTypeMessage extends UnaryMessage {
  sendTo(obj: Record<string, unknown>): unknown {
    return typeof obj;
  }

  toJS(ctx: Context, obj: Form): string {
    return `typeof ${emit(obj, ctx)}`;
  }
}