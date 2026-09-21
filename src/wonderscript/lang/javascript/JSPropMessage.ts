import { MessageArgs, MessageForm, Obj } from "../Message";
import { Keyword } from "../Keyword";
import { escapeChars } from "../../compiler/utils";
import { prStr } from "../../compiler";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emitSlotName } from "../../compiler/emit/slots";
import { emit } from "../../compiler/emit";
import { BaseMessage } from "../Message/BaseMessage";
import { Vector } from "../Vector";

export class JSPropMessage extends BaseMessage {
  static parse(msg: MessageForm): JSPropMessage {
    if (msg instanceof Array || msg instanceof Vector) {
      return new this('prop', 'js', msg.slice(1))
    }

    throw new Error(`invalid message form: ${prStr(msg)}`);
  }

  get interned() {
    const args = super.args;
    const last = args[args.length - 1];
    if (last instanceof Keyword) {
      return escapeChars(last.name);
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
      it instanceof Keyword ? escapeChars(it.name) : escapeChars(`${it}`)
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
