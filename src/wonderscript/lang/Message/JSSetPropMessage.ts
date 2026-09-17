import { JSMethodMessage } from "./JSMethodMessage";
import { Keyword } from "../Keyword";
import { escapeChars } from "../../compiler/utils";
import { Obj } from "../Message";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emit } from "../../compiler/emit";

export class JSSetPropMessage extends JSMethodMessage {
  get key(): unknown {
    const key = this.args[0];

    if (key instanceof Keyword) {
      return escapeChars(key.name());
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
      return `wonderscript.lang.Message.send(${emit(obj, ctx)}, [${this.keyword().toJS()}, ${emit(key as Form, ctx)}, ${emit(this.value as Form, ctx)}])`;
    }
  }
}
