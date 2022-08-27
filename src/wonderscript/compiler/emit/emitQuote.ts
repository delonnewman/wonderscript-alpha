import {isArray, isMap, isNumber, isString, isUndefined, map, str} from "../../lang/runtime";
import {EMPTY_ARRAY, FALSE_SYM, NULL_SYM, TRUE_SYM, UNDEFINED_SYM} from "../constants";

export function emitQuote(form) {
    if (form.length !== 2) throw new Error('One value should be quoted');
    return emitQuotedValue(form[1]);
}

function emitQuotedValue(val) {
    if (isString(val)) {
        return JSON.stringify(val);
    }
    if (isNumber(val)) {
        return str(val);
    }
    if (val === true) {
        return TRUE_SYM;
    }
    if (val === false) {
        return FALSE_SYM;
    }
    if (val === null) {
        return NULL_SYM;
    }
    if (isUndefined(val)) {
        return UNDEFINED_SYM;
    }
    if (isArray(val)) {
        if (val.length === 0) return EMPTY_ARRAY;
        return str('[', map(emitQuotedValue, val).join(', '), ']');
    }
    if (isMap(val)) {
        const parts = map((xs) => str('[', emitQuotedValue(xs[0]), ',', emitQuotedValue(xs[1]) ,']'), val);
        return str('(new Map([', parts.join(', '), ']))');
    }
    throw new Error('Invalid form: ' + val);
}

