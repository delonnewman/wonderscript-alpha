import {isArray, str} from "../../lang/runtime";
import {emit} from "../emit";
import {THROW_SYM} from "../constants";
import {Form} from "../core";
import {prStr} from "../prStr";

export type ThrowForm = [typeof THROW_SYM, Form];

export const isThrowForm = (form: Form): form is ThrowForm =>
    isArray(form) && form[0] === THROW_SYM && form.length === 2;

export function emitThrownException(form, env) {
    if (!isThrowForm(form)) throw new Error(`invalid ${THROW_SYM} form: ${prStr(form)}`);

    return `throw ${emit(form[1], env)}`;
}
