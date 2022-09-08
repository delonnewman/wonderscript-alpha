import {emit} from "../emit";
import {Form, isTaggedValue} from "../core";
import {AGET_SYM as AGET_STR} from "../constants";
import {prStr} from "../prStr";
import {Symbol} from "../../lang/Symbol";

export const AGET_SYM = Symbol.intern(AGET_STR);

export type ArrayAccessForm = [typeof AGET_SYM, any[], Form];

export const isArrayAccessForm = (form: Form): form is ArrayAccessForm =>
    isTaggedValue(form) && form[0].equals(AGET_SYM) && form.length === 3;

export function emitArrayAccess(form: Form, env) {
    if (!isArrayAccessForm(form)) throw new Error(`invalid ${AGET_SYM} form: ${prStr(form)}`);

    return `${emit(form[1], env)}[${emit(form[2], env)}]`;
}
