import {isArray} from "../../lang/runtime";
import {emit} from "../emit";
import {SET_SYM as SET_STR} from "../constants";
import {Form} from "../core";
import {prStr} from "../prStr";
import {isSymbol, Symbol} from "../../lang/Symbol";
import {Context} from "../../lang/Context";

export const SET_SYM = Symbol.intern(SET_STR);

export type AssignmentForm = [typeof SET_SYM, Form, Form];

export const isAssignmentForm = (form: Form): form is AssignmentForm =>
    isArray(form) && form[0].equals(SET_SYM) && form.length === 3;

export function emitAssignment(form, ctx: Context) {
    if (!isAssignmentForm(form)) throw new Error(`invalid ${SET_SYM} form: ${prStr(form)}`);

    const [_, obj, value] = form;
    if (isSymbol(obj) && !ctx.isMutable(obj)) {
        throw new Error(`cannot mutate an immutable value: ${prStr(obj)}`);
    }

    // TODO: check for definition meta data, this will have to wait until put in place definition meta objects

    return `${emit(obj, ctx)}=${emit(value, ctx)}`;
}
