import { emit } from "../emit";
import { Context } from "../../lang/Context";
import { SEND_SYM as SEND_STR } from "../constants";
import { Form, isTaggedValue, TaggedValue } from "../core";
import { prStr } from "../prStr";
import { Symbol } from "../../lang/Symbol";
import {
  JS_DIG_KW,
  JS_PROP_SET,
  Keyword,
  Message,
  RESPOND_TO_KW,
  Vector,
} from "../../lang";
import { CompilerError } from "../CompilerError";
import { emitSlotName } from "./slots";

export const SEND_SYM = Symbol.intern(SEND_STR);

export type SendForm = [typeof SEND_SYM, Form, TaggedValue | Symbol];

export const isSendForm = (form: Form): form is SendForm =>
  isTaggedValue(form) && form[0].equals(SEND_SYM) && form.length === 3;

export function emitSend(form: Form, ctx: Context): string {
  if (!isSendForm(form))
    throw new CompilerError(`invalid ${SEND_SYM} form: ${prStr(form)}`, ctx);

  let [_, obj, msg] = form;
  const objCode = emit(obj, ctx);

  if (msg instanceof Vector || Array.isArray(msg)) {
    const tag = msg[0];

    if (JS_DIG_KW.equals(tag)) {
      const slots = msg.slice(1);
      const slotName = slots
        .map((slot) => {
          const name = slot instanceof Keyword || typeof slot === "string" ? emitSlotName(slot) : emit(slot, ctx);
          return name !== undefined ? `.${name}` : `[${emit(slot, ctx)}]`;
        })
        .join("");

      return `(${objCode})${slotName}`;
    }

    if (RESPOND_TO_KW.equals(tag)) {
      const msgQuery = msg[1];

      if (msgQuery instanceof Keyword || typeof msgQuery === "string") {
        return `("${Message.intern((msgQuery))}" in ${emit(obj, ctx)})`;
      }

      return `wonderscript.lang.Message.send(${objCode}, ${emit(msg, ctx)})`;
    }

    if (JS_PROP_SET.equals(tag)) {
      const prop = msg[1];
      if (msg.length !== 3) {
        throw new Error(
          `invalid arguments expected 2, got ${msg.length - 1} instead`
        );
      }

      if (prop instanceof Keyword || typeof prop === "string") {
        return `(${emit(obj, ctx)}.${Message.intern(prop)}=${emit(msg[2], ctx)})`;
      }

      return `wonderscript.lang.Message.send(${objCode}, ${emit(msg, ctx)})`;
    }

    const args = Message.args(msg)
      .map((x) => emit(x, ctx))
      .join(", ");

    if (tag instanceof Keyword || typeof tag === "string") {
      return `${objCode}.${Message.intern(msg)}(${args})`;
    }

    return `${objCode}[${emit(tag, ctx)}](${args})`;
  }

  if (msg instanceof Keyword && msg.namespace() === 'js.prop') {
    return `${objCode}.${Message.intern(msg)}`;
  }

  if (msg instanceof Keyword || typeof msg === "string") {
    return `${objCode}.${Message.intern(msg)}()`;
  }

  return `wonderscript.lang.Message.send(${objCode}, ${emit(msg, ctx)})`;
}
