import {emit} from "./compiler/emit";
import {Env} from "./compiler/Env";
export const compile = emit;

export {evalString} from "./compiler/evalString"
export {compileString} from "./compiler/compileString"
export {readString} from "./compiler/readString"
export {macroexpand} from "./compiler/macroexpand"
export {prStr} from "./compiler/prStr"

export function evaluate(form, scope: Env) {
    return eval(emit(form, scope));
}

