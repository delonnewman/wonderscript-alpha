import { emit } from "../emit";
import { SET_SYM as SET_STR } from "../constants";
import { Form, isTaggedValue } from "../core";
import { prStr } from "../prStr";
import { Symbol } from "../../lang/Symbol";
import { Context } from "../../lang/Context";
import { CompilerError } from "../CompilerError";

export const SET_SYM = Symbol.intern(SET_STR);

export type AssignmentForm = [typeof SET_SYM, Form, Form];

export const isAssignmentForm = (form: unknown): form is AssignmentForm =>
  isTaggedValue(form) && form[0].equals(SET_SYM) && form.length === 3;

export function emitAssignment(form: Form, ctx: Context) {
  if (!isAssignmentForm(form))
    throw new CompilerError(`invalid ${SET_SYM} form: ${prStr(form)}`, ctx);

  const [_, obj, value] = form;
  if (obj instanceof Symbol && ctx.has(obj) && !ctx.isMutable(obj)) {
    throw new CompilerError(
      `cannot mutate an immutable value: ${prStr(obj)}`,
      ctx
    );
  }

  // TODO: check for definition meta data, this will have to wait until put in place definition meta objects

  return `${emit(obj, ctx)}=${emit(value, ctx)}`;
}
