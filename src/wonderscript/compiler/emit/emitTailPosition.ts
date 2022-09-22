import {Form, isRecurForm, isStatementForm, isThrowForm} from "../core";
import {RECUR_ERROR_MSG} from "../errorMessages";
import {emitRecursionPoint} from "./emitRecursionPoint";
import {emitThrownException} from "./emitThrownException";
import {str} from "../../lang/runtime";
import {emit} from "../emit";
import {Context} from "../../lang/Context";

export function emitTailPosition(form: Form, ctx: Context, def = 'return'): string {
    if (isRecurForm(form)) {
        if (!ctx.isRecursive()) throw new Error(RECUR_ERROR_MSG);
        return emitRecursionPoint(form, ctx);
    }

    if (isThrowForm(form)) {
        return emitThrownException(form, ctx);
    }

    if (isStatementForm(form)) {
        return emit(form, ctx);
    }

    return str(def, ' ', emit(form, ctx));
}
