import {isRecur, isThrow} from "../core";
import {RECUR_ERROR_MSG} from "../errorMessages";
import {emitRecursionPoint} from "./emitRecursionPoint";
import {emitThrownException} from "./emitThrownException";
import {str} from "../../lang/runtime";
import {emit} from "./index";

export function emitTailPosition(x, env, def = 'return'): string {
    if (isRecur(x)) {
        if (!env.isRecursive()) throw new Error(RECUR_ERROR_MSG);
        return emitRecursionPoint(x, env);
    }
    if (isThrow(x)) {
        return emitThrownException(x, env);
    }

    return str(def, ' ', emit(x, env));
}
