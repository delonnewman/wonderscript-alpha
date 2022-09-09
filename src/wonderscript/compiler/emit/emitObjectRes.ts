import {isArray, isString, map, str} from "../../lang/runtime";
import {emit} from "../emit";
import {escapeChars} from "../utils";
import {Context} from "../../lang/Context";
import {DOT_SYM as DOT_STR} from "../constants";
import {Form, isTaggedValue, TaggedValue} from "../core";
import {prStr} from "../prStr";
import {isSymbol, Symbol} from "../../lang/Symbol";

export const DOT_SYM = Symbol.intern(DOT_STR)

export type ObjectResForm = [typeof DOT_SYM, Form, TaggedValue | Symbol];

export const isObjectResForm = (form: Form): form is ObjectResForm =>
    isTaggedValue(form) && form[0].equals(DOT_SYM) && form.length === 3;

export function emitObjectRes(form, env: Context): string {
    if (!isObjectResForm(form)) throw new Error(`invalid ${DOT_SYM} form: ${prStr(form)}`);

    const [_, obj, prop] = form;

    if (isTaggedValue(prop)) {
        const [method, ...args] = prop;

        return str('(', emit(obj, env), ').', escapeChars(method.name()), '(',
            map((x) => emit(x, env), args).join(', '), ')');
    }

    if (isSymbol(prop)) {
        const name = prop.name()
        if (name.startsWith('-')) {
            return str('(', emit(obj, env), ').', escapeChars(name.slice(1)));
        }
        else {
            return str('(', emit(obj, env), ').', escapeChars(name), '()');
        }
    }

    throw new Error(`invalid ${DOT_SYM} form: ${prStr(form)}`);
}
