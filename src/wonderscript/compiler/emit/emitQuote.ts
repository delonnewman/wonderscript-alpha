import {isArray, isMap, isNumber, isString, isUndefined, map, str} from "../../lang/runtime";
import {EMPTY_ARRAY, FALSE_SYM, NULL_SYM, QUOTE_SYM as QUOTE_STR, TRUE_SYM, UNDEFINED_SYM} from "../constants";
import {Form, isTaggedValue} from "../core";
import {prStr} from "../prStr";
import {isSymbol, Symbol} from "../../lang/Symbol";
import {MetaData} from "../../lang/Meta";
import {isKeyword} from "../../lang/Keyword";
import {emitKeyword} from "./emitKeyword";

export const QUOTE_SYM = Symbol.intern(QUOTE_STR);
export type QuoteForm = [typeof QUOTE_SYM, Form];

export const isQuoteForm = (form: Form): form is QuoteForm =>
    isTaggedValue(form) && form[0].equals(QUOTE_SYM) && form.length === 2;

export function emitQuote(form: Form): string {
    if (!isQuoteForm(form)) throw new Error(`invalid ${QUOTE_SYM} form: ${prStr(form)}`)

    return emitQuotedValue(form[1]);
}

export function emitQuotedMetaData(meta: MetaData): string {
    const buffer = [];
    for (let entry of meta) {
        const valStr = entry[1]?.toJS ? entry[1].toJS() : JSON.stringify(entry[1])
        buffer.push(`[${entry[0].toJS()}, ${valStr}]`)
    }

    return `new Map([${buffer.join(', ')}])`
}

const SYM_FUNC = 'wonderscript.core.symbol';

function emitQuotedSymbol(sym: Symbol): string {
    if (sym.hasMeta() && sym.hasNamespace()) {
        const m = emitQuotedMetaData(sym.meta());
        return `${SYM_FUNC}(${JSON.stringify(sym.namespace())},${JSON.stringify(sym.name())},${m})`
    }

    if (sym.hasNamespace()) {
        return `${SYM_FUNC}(${JSON.stringify(sym.namespace())},${JSON.stringify(sym.name())})`
    }

    return `${SYM_FUNC}(${JSON.stringify(sym.name())})`
}

function emitQuotedValue(val: any): string {
    if (isString(val)) {
        return JSON.stringify(val);
    }
    if (isSymbol(val)) {
        return emitQuotedSymbol(val);
    }
    if (isKeyword(val)) {
        return emitKeyword(val);
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

    throw new Error(`Invalid quoted form: ${prStr(val)}`);
}

