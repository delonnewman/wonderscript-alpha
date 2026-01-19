import { emit } from "../emit";
import { Context } from "../../lang/Context";
import { Form, isTaggedValue } from "../core";
import { prStr } from "../prStr";
import { CompilerError } from "../CompilerError";

export type BinOpForm = [Symbol, Form, Form];

export const isBinOpForm = (form: unknown): form is BinOpForm =>
  isTaggedValue(form) && form.length === 3;

export function emitBinOp(form: Form, env: Context, op = form[0]): string {
  if (!isBinOpForm(form))
    throw new CompilerError(`invalid binary operator form: ${prStr(form)}`);

  return `(${emit(form[1], env)}${op}${emit(form[2], env)})`;
}
