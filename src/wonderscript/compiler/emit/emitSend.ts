import { map, str } from "../../lang/runtime";
import { emit } from "../emit";
import { escapeChars } from "../utils";
import { Context } from "../../lang/Context";
import { SEND_SYM as SEND_STR } from "../constants";
import { Form, isTaggedValue, TaggedValue } from "../core";
import { prStr } from "../prStr";
import { isSymbol, Symbol } from "../../lang/Symbol";

export const SEND_SYM = Symbol.intern(SEND_STR);

export type SendForm = [typeof SEND_SYM, Form, TaggedValue | Symbol];

export const isObjectResForm = (form: Form): form is SendForm =>
  isTaggedValue(form) && form[0].equals(SEND_SYM) && form.length === 3;

export function emitSend(form: Form, ctx: Context): string {
  if (!isObjectResForm(form))
    throw new Error(`invalid ${SEND_SYM} form: ${prStr(form)}`);

  const [_, obj, msg] = form;

  if (isTaggedValue(msg)) {
    const [method, ...args] = msg;

    return `(${emit(obj, ctx)}).${escapeChars(method.name())}(${map((x) => emit(x, ctx), args).join(", ")})`;
  }

  if (isSymbol(msg)) {
    const name = msg.name();
      return `(${emit(obj, ctx)}).${escapeChars(name)}()`;
  }

  throw new Error(`invalid ${SEND_SYM} form: ${prStr(form)}`);
}
