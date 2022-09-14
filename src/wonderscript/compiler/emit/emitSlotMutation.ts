import {emit} from "../emit";
import {SSET_SYM as SSET_STR} from "../constants";
import {Form, isTaggedValue} from "../core";
import {prStr} from "../prStr";
import {Symbol} from "../../lang/Symbol";

export const SSET_SYM = Symbol.intern(SSET_STR);

export type SlotMutationForm = [typeof SSET_SYM, any[], Form, Form];

export const isSlotMutationForm = (form: Form): form is SlotMutationForm =>
    isTaggedValue(form) && form[0].equals(SSET_SYM) && form.length === 4;

export function emitSlotMutation(form, env) {
    if (!isSlotMutationForm(form)) throw new Error(`invalid ${SSET_SYM} form: ${prStr(form)}`);

    return `${emit(form[1], env)}[${emit(form[2], env)}]=${emit(form[3], env)}`;
}

