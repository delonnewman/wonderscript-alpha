import {isArray} from "../../lang/runtime";
import {emit} from "../emit";
import {ASET_SYM} from "../constants";
import {Form, isTaggedValue} from "../core";
import {prStr} from "../prStr";

export type ArrayMutationForm = [typeof ASET_SYM, any[], Form, Form];

export const isArrayMutationForm = (form: Form): form is ArrayMutationForm =>
    isTaggedValue(form) && form[0] === ASET_SYM && form.length === 4;

export function emitArrayMutation(form, env) {
    if (!isArrayMutationForm(form)) throw new Error(`invalid ${ASET_SYM} form: ${prStr(form)}`);

    return `${emit(form[1], env)}[${emit(form[2], env)}]=${emit(form[3], env)}`;
}

