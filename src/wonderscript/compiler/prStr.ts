import {FALSE_SYM, NIL_SYM, TRUE_SYM} from "./constants";
import {
    isArray,
    isArrayLike,
    isBoolean,
    isFunction,
    isMap,
    isNumber,
    isString,
    map,
    str
} from "../lang/runtime";
import {Form} from "./core";
import {isSymbol} from "../lang/Symbol";
import {isKeyword} from "../lang/Keyword";

export function prStr(form: Form): string {
    if (form == null) return NIL_SYM;
    if (isNumber(form)) return `${form}`;

    if (isBoolean(form)) {
        return form ? TRUE_SYM : FALSE_SYM;
    }

    if (isSymbol(form) || isKeyword(form)) {
        return `${form}`;
    }

    if (isString(form)) {
        return JSON.stringify(form);
    }

    if (isArray(form)) {
        if (form.length === 0) {
            return '()';
        }

        const parts = form.map(prStr);
        return str('(', parts.join(' '), ')');
    }

    if (isFunction(form)) {
        return `#js/function "${form}"`;
    }

    if (isMap(form)) {
        const parts = map((entry) => `${prStr(entry[0])} ${prStr(entry[1])}`, form);
        return str('{', parts.join(' '), '}');
    }

    if (isFunction(form.toString)) {
        return form.toString();
    }

    if (isArrayLike(form)) {
        const parts = Array.prototype.map.call(form, (x, i) => `${i} ${prStr(x)}`);
        return `#js/object {${parts.join(', ')}}`;
    }

    return `${form}`;
}
