import {isArray, isString, map, str} from "../../lang/runtime";
import {emit} from "../emit";
import {escapeChars} from "../utils";
import {Env} from "../Env";
import {DOT_SYM as DOT_STR} from "../constants";
import {Form, isTaggedValue} from "../core";
import {prStr} from "../prStr";
import {Symbol} from "../../lang/Symbol";

export const DOT_SYM = Symbol.intern(DOT_STR)

export type ObjectResForm = [typeof DOT_SYM, Form, Form];

export const isObjectResForm = (form: Form): form is ObjectResForm =>
    isTaggedValue(form) && form[0].equals(DOT_SYM) && form.length === 3;

export function emitObjectRes(form, env: Env): string {
    if (!isObjectResForm(form)) throw new Error(`invalid ${DOT_SYM} form: ${prStr(form)}`);

    const [_, obj, prop] = form;

    if (isArray(prop)) {
        const [method, ...args] = prop;

        return str('(', emit(obj, env), ').', escapeChars(method), '(',
            map((x) => emit(x, env), args).join(', '), ')');
    }

    if (isString(prop)) {
        if (prop.startsWith('-')) {
            return str('(', emit(obj, env), ').', escapeChars(prop.slice(1)));
        }
        else {
            return str('(', emit(obj, env), ').', escapeChars(prop), '()');
        }
    }

    throw new Error("'.' form requires at least 3 elements");
}
