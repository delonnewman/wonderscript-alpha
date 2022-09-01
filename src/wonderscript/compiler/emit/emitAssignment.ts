import {isArray, str} from "../../lang/runtime";
import {emit} from "../emit";
import {SET_SYM} from "../constants";
import {Form} from "../core";
import {prStr} from "../prStr";

export type AssignmentForm = [typeof SET_SYM, Form, Form];

export const isAssignmentForm = (form: Form): form is AssignmentForm =>
    isArray(form) && form[0] === SET_SYM && form.length === 3;

export function emitAssignment(form, env) {
    if (!isAssignmentForm(form)) throw new Error(`invalid ${SET_SYM} form: ${prStr(form)}`);

    return str(emit(form[1], env), " = ", emit(form[2], env));
}
