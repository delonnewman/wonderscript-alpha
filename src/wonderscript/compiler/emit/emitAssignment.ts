import {isArray, str} from "../../lang/runtime";
import {emit} from "../emit";
import {SET_SYM as SET_STR} from "../constants";
import {Form} from "../core";
import {prStr} from "../prStr";
import {Symbol} from "../../lang/Symbol";

export const SET_SYM = Symbol.intern(SET_STR);

export type AssignmentForm = [typeof SET_SYM, Form, Form];

export const isAssignmentForm = (form: Form): form is AssignmentForm =>
    isArray(form) && form[0].equals(SET_SYM) && form.length === 3;

export function emitAssignment(form, env) {
    if (!isAssignmentForm(form)) throw new Error(`invalid ${SET_SYM} form: ${prStr(form)}`);

    return `${emit(form[1], env)}=${emit(form[2], env)}`;
}
