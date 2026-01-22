import { map, str } from "../../lang/runtime";
import { emit } from "../emit";
import { escapeChars } from "../utils";
import { Context } from "../../lang/Context";
import { DOT_SYM as DOT_STR } from "../constants";
import { Form, isTaggedValue, TaggedValue } from "../core";
import { prStr } from "../prStr";
import { Symbol } from "../../lang/Symbol";
import { CompilerError } from "../CompilerError";

export const DOT_SYM = Symbol.intern(DOT_STR);

export type ObjectResForm = [typeof DOT_SYM, Form, TaggedValue | Symbol];

export const isObjectResForm = (form: Form): form is ObjectResForm =>
  isTaggedValue(form) && form[0].equals(DOT_SYM) && form.length === 3;

export function emitObjectRes(form: Form, env: Context): string {
  if (!isObjectResForm(form))
    throw new CompilerError(`invalid ${DOT_SYM} form: ${prStr(form)}`, env);

  const [_, obj, prop] = form;

  if (isTaggedValue(prop)) {
    const [method, ...args] = prop;

    const name = escapeChars(method.name());
    return `(${emit(obj, env)}).${name}(${map((x) => emit(x, env), args).join(", ")})`;
  }

  if (prop instanceof Symbol) {
    const name = prop.name();
    if (name.startsWith("-")) {
      return str("(", emit(obj, env), ").", escapeChars(name.slice(1)));
    } else {
      return str("(", emit(obj, env), ").", escapeChars(name), "()");
    }
  }

  throw new CompilerError(`invalid ${DOT_SYM} form: ${prStr(form)}`, env);
}
