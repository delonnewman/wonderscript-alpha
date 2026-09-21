import { BinaryMessage } from "../Message/BinaryMessage";
import { MessageForm } from "../Message";
import { Vector } from "../Vector";
import { prStr } from "../../compiler";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emit } from "../../compiler/emit";

export class JSInstanceOfMessage extends BinaryMessage {
  static parse(msg: MessageForm) {
    if (msg instanceof Array || msg instanceof Vector) {
      return new this("instance?", "js", msg[1]);
    }

    throw new Error(`invalid message: ${prStr(msg)}`);
  }

  sendTo(obj: Record<string, unknown>): unknown {
    return obj instanceof this.args[0];
  }

  toJS(ctx: Context, obj: Form): string {
    return `(${emit(obj, ctx)} instanceof ${emit(this.args[0], ctx)})`;
  }
}
