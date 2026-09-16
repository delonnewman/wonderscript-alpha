import { emit } from "../emit";
import { Context } from "../../lang/Context";
import { SEND_SYM as SEND_STR } from "../constants";
import { Form, isTaggedValue, TaggedValue } from "../core";
import { prStr } from "../prStr";
import { Symbol } from "../../lang/Symbol";
import { Keyword, Message, Vector } from "../../lang";
import { CompilerError } from "../CompilerError";
import { pt } from "../../util";

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
    const args = Message.args(msg)
      .map((x) => emit(x, ctx))
      .join(", ");

    if (tag instanceof Keyword || typeof tag === "string") {
      return `${objCode}.${Message.intern(msg)}(${args})`;
    } else {
      pt(`tag is not a keyword or string: ${prStr(form)}`);
      return `${objCode}[${emit(tag, ctx)}](${args})`;
    }
  }

  if (msg instanceof Keyword || typeof msg === "string") {
    return `${objCode}.${Message.intern(msg)}()`;
  }

  return `wonderscript.lang.Message.send(${objCode}, ${emit(msg, ctx)})`;
}
