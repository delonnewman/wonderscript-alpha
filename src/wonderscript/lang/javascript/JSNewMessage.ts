import { MessageForm } from "../Message";
import { Vector } from "../Vector";
import { prStr } from "../../compiler/prStr";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emit } from "../../compiler/emit";
import { BaseMessage } from "../Message/BaseMessage";
import { Keyword } from "../Keyword";
import { Symbol } from "../Symbol";

interface Constructor {
  (...args: unknown[]): void;
}

export class JSNewMessage extends BaseMessage {
  static SIMPLE = new JSNewMessage("new", "js");

  static parse(msg: MessageForm) {
    if (msg instanceof Array || msg instanceof Vector) {
      return new this("new", "js", msg.slice(1));
    } else if (
      msg instanceof Symbol ||
      msg instanceof Keyword ||
      typeof msg === "string"
    ) {
      return this.SIMPLE;
    }

    throw new Error(`invalid message: ${prStr(msg)}`);
  }

  sendTo(obj: Constructor): unknown {
    return new obj(...this.args);
  }

  toJS(ctx: Context, obj: Form): string {
    const args = this.args.map((arg) => emit(arg, ctx));
    return `new ${emit(obj, ctx)}(${args.join(", ")})`;
  }
}

