import { map } from "../../lang/runtime";
import { emit } from "../emit";
import { Context } from "../../lang/Context";
import { NEW_SYM as NEW_STR } from "../constants";
import { Form, isTaggedValue } from "../core";
import { prStr } from "../prStr";
import { isSymbol, Symbol } from "../../lang/Symbol";
import { CompilerError } from "../CompilerError";

export const NEW_SYM = Symbol.intern(NEW_STR);

export type ClassInitForm = [typeof NEW_SYM, Symbol, ...Form[]];

export const isClassInitForm = (form: unknown): form is ClassInitForm =>
  isTaggedValue(form) && form[0].equals(NEW_SYM) && form[1] instanceof Symbol;

export function emitClassInit(form: Form, env: Context): string {
  if (!isClassInitForm(form))
    throw new CompilerError(`invalid ${NEW_SYM} form: ${prStr(form)}`, env);

  const args = map((arg) => emit(arg, env), form.slice(2));

  return `new ${emit(form[1], env)}(${args.join(", ")})`;
}
