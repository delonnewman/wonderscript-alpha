import {isArray, isString, map, str} from "../../lang/runtime";
import {emit} from "../emit";
import {Env} from "../Env";
import {NEW_SYM} from "../constants";
import {Form} from "../core";
import {prStr} from "../prStr";

export type ClassInitForm = [typeof NEW_SYM, string, ...Form[]];

export const isClassInitForm = (form: Form): form is ClassInitForm =>
    isArray(form) && form[0] === NEW_SYM && isString(form[1]);

export function emitClassInit(form, env: Env): string {
    if (!isClassInitForm(form)) throw new Error(`invalid ${NEW_SYM} form: ${prStr(form)}`);

    const args = map((arg) => emit(arg, env), form.slice(2)).join(', ');

    return str('new ', emit(form[1], env), '(', args, ')');
}
