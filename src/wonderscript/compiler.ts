import {emit} from "./compiler/emit";
import {Context} from "./lang/Context";
import { prStr } from "./compiler/prStr";
export const compile = emit;

export {evalString} from "./compiler/evalString"
export {compileString} from "./compiler/compileString"
export {readString} from "./compiler/readString"
export {macroexpand} from "./compiler/macroexpand"
export {prStr} from "./compiler/prStr"

export function evaluate(form, scope: Context) {
    const code = emit(form, scope);
    const result = eval(code);
    return result;
}

