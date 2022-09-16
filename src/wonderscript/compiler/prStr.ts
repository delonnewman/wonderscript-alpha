import {FALSE_SYM, NIL_SYM, TRUE_SYM} from "./constants";
import {
    isArray,
    isArrayLike,
    isBoolean,
    isFunction,
    isMap,
    isNumber,
    isObject,
    isSet,
    isString,
    map,
} from "../lang/runtime";
import {Form} from "./core";
import {isSymbol} from "../lang/Symbol";
import {isKeyword} from "../lang/Keyword";
import {isList} from "../lang/List";
import {isVector} from "../lang/Vector";

const EMPTY_LIST  = '()';
const EMPTY_ARRAY = '[]';

export function prStr(form: Form): string {
    if (form == null) return NIL_SYM;
    if (isNumber(form)) return `${form}`;

    if (isBoolean(form)) {
        return form ? TRUE_SYM : FALSE_SYM;
    }

    if (isSymbol(form) || isKeyword(form)) {
        return form.toString();
    }

    if (isString(form)) {
        return JSON.stringify(form);
    }

    if (isList(form)) {
        if (form.count() === 0) {
            return EMPTY_LIST;
        }

        const parts = map(prStr, form);
        return `(${parts.join(' ')})`;
    }

    if (isArray(form)) {
        if (form.length === 0) {
            return EMPTY_LIST;
        }

        const parts = form.map(prStr);
        return `(${parts.join(' ')})`;
    }

    if (isVector(form)) {
        if (form.length === 0) {
            return EMPTY_ARRAY;
        }

        const parts = Array.prototype.map.call(form, prStr);
        return `[${parts.join(' ')}]`;
    }

    if (isFunction(form)) {
        return `#js/function "${form}"`;
    }

    if (isMap(form)) {
        const parts = [];
        for (let entry of form) {
            const key = prStr(entry[0]);
            const val = prStr(entry[1]);
            parts.push(`${key} ${val}`);
        }
        return `{${parts.join(' ')}}`;
    }

    if (isSet(form)) {
        const parts = [];
        for (let entry of form) {
            const val = prStr(entry);
            parts.push(val);
        }
        return `#{${parts.join(' ')}}`;
    }

    if (isArrayLike(form)) {
        const parts = Array.prototype.map.call(form, (x, i) => `${i} ${prStr(x)}`);
        return `#js/object {${parts.join(', ')}}`;
    }

    if (isObject(form)) {
        const keys = Object.keys(form);
        return `#js/object {${keys.map((k) => `${prStr(k)} ${prStr(form[k])}`).join(', ')}}`
    }

    return `${form}`;
}
