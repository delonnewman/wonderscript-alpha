import { map, str } from "../../lang/runtime";
import { emit } from "../emit";
import { escapeChars } from "../utils";
import { Context } from "../../lang/Context";
import { SEND_SYM as SEND_STR } from "../constants";
import { Form, isTaggedValue, TaggedValue } from "../core";
import { prStr } from "../prStr";
import { Symbol } from "../../lang/Symbol";
import { emitSlotName } from "./slots";
import { Keyword, Vector } from "../../lang";
import { CompilerError } from "../CompilerError";

export const SEND_SYM = Symbol.intern(SEND_STR);

export type SendForm = [typeof SEND_SYM, Form, TaggedValue | Symbol];

export const isSendForm = (form: Form): form is SendForm =>
  isTaggedValue(form) && form[0].equals(SEND_SYM) && form.length === 3;

export function emitSend(form: Form, ctx: Context): string {
  if (!isSendForm(form))
    throw new CompilerError(`invalid ${SEND_SYM} form: ${prStr(form)}`, ctx);

  let [_, obj, msg] = form;
  let slotName = emitSlotName(msg);

  if (slotName) {
    return `(${emit(obj, ctx)}).${escapeChars(slotName)}()`;
  }

  if (
    isTaggedValue(msg) ||
    (msg instanceof Vector && msg[0] instanceof Keyword)
  ) {
    const [method, ...args] = Array.prototype.slice.call(msg);

    const strArgs = map<Form>((x) => emit(x, ctx), args).join(", ");
    return `(${emit(obj, ctx)}).${escapeChars(method.name())}(${strArgs})`;
  }

  // TODO: add late bound evaluation of slot names
  return `(${emit(obj, ctx)})[${emit(msg, ctx)}]()`;
}
