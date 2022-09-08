import {emit} from "../emit";
import {ALENGTH_SYM as ALENGTH_STR} from "../constants";
import {Form, isTaggedValue} from "../core";
import {prStr} from "../prStr";
import {Symbol} from "../../lang/Symbol";

export const ALENGTH_SYM = Symbol.intern(ALENGTH_STR);

export type ArrayLengthForm = [typeof ALENGTH_SYM, any[], Form];

export const isArrayLengthForm = (form: Form): form is ArrayLengthForm =>
    isTaggedValue(form) && form[0].equals(ALENGTH_SYM) && form.length === 2;

export function emitArrayLength(form, env) {
    if (!isArrayLengthForm(form)) throw new Error(`invalid ${ALENGTH_SYM} form: ${prStr(form)}`);

    return `${emit(form[1], env)}.length`;
}

