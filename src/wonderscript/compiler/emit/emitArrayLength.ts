import {isArray} from "../../lang/runtime";
import {emit} from "../emit";
import {ALENGTH_SYM} from "../constants";
import {Form, isTaggedValue} from "../core";
import {prStr} from "../prStr";

export type ArrayLengthForm = [typeof ALENGTH_SYM, any[], Form];

export const isArrayLengthForm = (form: Form): form is ArrayLengthForm =>
    isTaggedValue(form) && form[0] === ALENGTH_SYM && form.length === 2;

export function emitArrayLength(form, env) {
    if (!isArrayLengthForm(form)) throw new Error(`invalid ${ALENGTH_SYM} form: ${prStr(form)}`);

    return `${emit(form[1], env)}.length`;
}

