import { BinaryMessage } from "../Message/BinaryMessage";
import { MessageForm } from "../Message";
import { Vector } from "../Vector";
import { prStr } from "../../compiler/prStr";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emit } from "../../compiler/emit";

export class JSEquivMessage extends BinaryMessage {
  static parse(msg: MessageForm) {
    if (msg instanceof Array || msg instanceof Vector) {
      return new this("equiv?", "js", msg.slice(1));
    }

    throw new Error(`invalid message: ${prStr(msg)}`);
  }

  sendTo(obj: Record<string, unknown>): unknown {
    return obj == this.args[0];
  }

  toJS(ctx: Context, obj: Form): string {
    return `(${emit(obj, ctx)}==${emit(this.args[0], ctx)})`;
  }
}

