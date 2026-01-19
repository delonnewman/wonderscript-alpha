import { emit } from "../emit";
import { THROW_SYM as THROW_STR, THROW_CLASS } from "../constants";
import { Form, isTaggedValue } from "../core";
import { prStr } from "../prStr";
import { Symbol } from "../../lang/Symbol";
import { Context } from "../../lang/Context";
import { CompilerError } from "../CompilerError";

export const THROW_SYM = Symbol.intern(THROW_STR);

export type ThrowForm = [typeof THROW_SYM, Form];

export const isThrowForm = (form: Form): form is ThrowForm =>
  isTaggedValue(form, THROW_SYM) && form.length === 2;

export function emitThrownException(form: Form, env: Context) {
  if (!isThrowForm(form))
    throw new CompilerError(`invalid ${THROW_SYM} form: ${prStr(form)}`);

  return `throw new ${THROW_CLASS}(${emit(form[1], env)})`;
}
