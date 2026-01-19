import { emit } from "../emit";
import { Context } from "../../lang/Context";
import { Form, isTaggedValue, isRecurForm } from "../core";
import { IF_SYM as IF_STR } from "../constants";
import { prStr } from "../prStr";
import { Symbol } from "../../lang/Symbol";
import { isThrowForm } from "./emitThrownException";
import { FN_SYM } from "./emitFunc";
import { Keyword } from "../../lang/Keyword";
import { emitTailPosition } from "./emitTailPosition";

export const IF_SYM = Symbol.intern<typeof IF_STR>(IF_STR);
export const ELSE_KEY = Keyword.intern<"else">("else");
const COND_SYM = Symbol.intern<"cond">("cond");

export type IfForm = [typeof IF_SYM, Form, Form, Form?];

export const isIfForm = (form: unknown): form is IfForm =>
  isTaggedValue(form, IF_SYM) && form.length >= 3 && form.length <= 4;

export function emitIf(form: Form, env: Context): string {
  if (!isIfForm(form))
    throw new Error(`invalid ${IF_SYM} form: ${prStr(form)}`);

  let [_, pred, consequent, alternate] = form;

  if (isThrowForm(consequent)) {
    consequent = [[FN_SYM, [], consequent]];
  }

  if (isThrowForm(alternate)) {
    alternate = [[FN_SYM, [], alternate]];
  }

  if (ELSE_KEY.equals(pred)) {
    pred = true;
  }

  if (
    pred === true &&
    (alternate == null || isTaggedValue(alternate, COND_SYM))
  ) {
    return `${emit(consequent, env)}`;
  }

  const tail = isRecurForm(alternate)
    ? `(function(){${emitTailPosition(alternate, env)}}())`
    : emit(alternate, env);

  return `(${emit(pred, env)}?(${emit(consequent, env)}):(${tail}))`;
}
