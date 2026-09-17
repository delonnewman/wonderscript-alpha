import { MessageArgs, Obj } from "../Message";
import { Keyword } from "../Keyword";
import { escapeChars } from "../../compiler/utils";
import { prStr } from "../../compiler";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emitSlotName } from "../../compiler/emit/slots";
import { emit } from "../../compiler/emit";
import { BaseMessage } from "./BaseMessage";

export class JSPropMessage extends BaseMessage {
  get interned() {
    const args = super.args;
    const last = args[args.length - 1];
    if (last instanceof Keyword) {
      return escapeChars(last.name());
    }
    return escapeChars(`${last}`);
  }

  toString(): string {
    if (this.args.length === 0) {
      return prStr(Keyword.intern(this.name, this.namespace));
    }
  }

  sendTo(obj: Obj): unknown {
    const args = Array.from(this.args).map((it) =>
      it instanceof Keyword ? escapeChars(it.name()) : escapeChars(`${it}`)
    );

    let val: unknown = obj;
    while (args.length > 0) {
      val = val[args.shift()!];
    }

    return val;
  }

  get arity(): number {
    return -1; // always splat
  }

  allArgs(): MessageArgs {
    return super.args;
  }

  get args(): MessageArgs {
    const all = this.allArgs();
    return this.isWithinQuery() ? all.slice(0, all.length - 1) : all;
  }

  toJS(ctx: Context, obj: Form): string {
    const str = this.args
      .map((prop) => {
        const name =
          prop instanceof Keyword || typeof prop === "string"
            ? emitSlotName(prop)
            : emit(prop, ctx);
        return name !== undefined ? `.${name}` : `[${emit(prop, ctx)}]`;
      })
      .join("");

    return `${emit(obj, ctx)}${str}`;
  }
}
