import {emit} from "./compiler/emit";
export const compile = emit;

export {evaluate} from "./compiler/core";
export {evalString} from "./compiler/evalString"
export {compileString} from "./compiler/compileString"
export {readString} from "./compiler/readString"
export {macroexpand} from "./compiler/macroexpand"
export {prStr} from "./compiler/prStr"