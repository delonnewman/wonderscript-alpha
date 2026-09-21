import { JSMethodMessage } from "./JSMethodMessage";
import { Keyword } from "../Keyword";
import { escapeChars } from "../../compiler/utils";
import { MessageForm, Obj } from "../Message";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emit } from "../../compiler/emit";
import { Vector } from "../Vector";
import { prStr } from "../../compiler";

export class JSSetPropMessage extends JSMethodMessage {
  static parse(msg: MessageForm) {
    if (msg instanceof Array || msg instanceof Vector) {
      return new JSSetPropMessage('set!', 'js', msg.slice(1));
    }

    throw new Error(`invalid message form: ${prStr(msg)}`);
  }

  get key(): unknown {
    const key = this.args[0];

    if (key instanceof Keyword) {
      return escapeChars(key.name);
    } else if (typeof key === "string") {
      return escapeChars(key);
    }

    return key;
  }

  get value(): unknown {
    return this.args[1];
  }

  sendTo(obj: Obj): Obj {
    obj[`${this.key}`] = this.value;
    return obj;
  }

  toJS(ctx: Context, obj: Form): string {
    const key = this.key;
    if (typeof key === "string") {
      return `${emit(obj, ctx)}.${this.key}=${emit(this.value as Form, ctx)}`;
    } else {
      return `wonderscript.lang.Message.send(${emit(obj, ctx)}, [${this.toKeyword().toJS()}, ${emit(key as Form, ctx)}, ${emit(this.value as Form, ctx)}])`;
    }
  }
}
