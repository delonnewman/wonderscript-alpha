import { emit } from "./compiler/emit";
import { Context } from "./lang/Context";
import { Form } from "./compiler/core";
import { jsEval } from "./compiler/jsEval";
export const compile = emit;

export { evalString } from "./compiler/evalString";
export { compileString } from "./compiler/compileString";
export { readString } from "./compiler/readString";
export { macroexpand } from "./compiler/macroexpand";
export { prStr } from "./compiler/prStr";

export function evaluate(form: Form, scope: Context) {
  const code = emit(form, scope);
  const result = jsEval(code);
  return result;
}
