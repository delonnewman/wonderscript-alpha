import { emit } from "../emit";
import { Context } from "../../lang/Context";
import { SEND_SYM as SEND_STR } from "../constants";
import { Form, isTaggedValue, TaggedValue } from "../core";
import { prStr } from "../prStr";
import { Symbol } from "../../lang/Symbol";
import {
  Keyword,
  Message,
  Vector,
} from "../../lang";
import { CompilerError } from "../CompilerError";

export const SEND_SYM = Symbol.intern(SEND_STR);

export type SendForm = [typeof SEND_SYM, Form, TaggedValue | Symbol];

export const isSendForm = (form: Form): form is SendForm =>
  isTaggedValue(form) && form[0].equals(SEND_SYM) && form.length === 3;

export function emitSend(form: Form, ctx: Context): string {
  if (!isSendForm(form))
    throw new CompilerError(`invalid ${SEND_SYM} form: ${prStr(form)}`, ctx);

  let [_, obj, msg] = form;
  if (msg instanceof Vector || Array.isArray(msg)) {
    return Message.compound(msg).toJS(ctx, obj);
  }

  if (msg instanceof Keyword || typeof msg === "string") {
    return Message.simple(msg).toJS(ctx, obj);
  }

  return `wonderscript.lang.Message.send(${emit(obj, ctx)}, ${emit(msg, ctx)})`;
}
