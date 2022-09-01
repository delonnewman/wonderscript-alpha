import {isArray, isMap, isNumber, isString, isUndefined, map, str} from "../../lang/runtime";
import {EMPTY_ARRAY, FALSE_SYM, NULL_SYM, QUOTE_SYM, TRUE_SYM, UNDEFINED_SYM} from "../constants";
import {Form, isTaggedValue} from "../core";
import {prStr} from "../prStr";

export type QuoteForm = [typeof QUOTE_SYM, Form];

export const isQuoteForm = (form: Form): form is QuoteForm =>
    isTaggedValue(form) && form[0] === QUOTE_SYM && form.length === 2;

export function emitQuote(form: Form): string {
    if (!isQuoteForm(form)) throw new Error(`invalid ${QUOTE_SYM} form: ${prStr(form)}`)

    return emitQuotedValue(form[1]);
}

function emitQuotedValue(val): string {
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

