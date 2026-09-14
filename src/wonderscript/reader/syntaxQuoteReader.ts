import { PushBackReader } from "./PushBackReader";
import { _read } from "./read";
import { Symbol } from "../lang/Symbol";
import { Form, isTaggedValue } from "../compiler/core";
import { UNQUOTE_SPLICING_SYM, UNQUOTE_SYM } from "./unquoteReader";

export const QUOTE_SYM = Symbol.intern('quote');
export const ARRAY_SYM = Symbol.intern('array');

function isUnquoteSplicing(form: Form) {
    return isTaggedValue(form) && form[0].equals(UNQUOTE_SPLICING_SYM);
}

function syntaxQuote(value: unknown): Form {
    if (isTaggedValue(value) && value[0].equals(UNQUOTE_SYM)) {
        return value[1];
    }
    if (isTaggedValue(value) && value[0].equals(UNQUOTE_SPLICING_SYM)) {
        return value;
    }
    if (Array.isArray(value)) {
        const quoted = value.map(syntaxQuote);
        const indexes = [];
        for (let i = 0; i < quoted.length; i++) {
            if (isUnquoteSplicing(value)) {
                return indexes.push(i);
            }
        }
        console.error('indexes', indexes);
        return [ARRAY_SYM].concat(quoted);
    }
    if (value instanceof Symbol) {
        return [QUOTE_SYM, value];
    }
    return value as Form;
}

export function syntaxQuoteReader(r: PushBackReader, _: unknown, opts: Record<string, unknown>): unknown {
    const value = _read(r, true, null, true, opts);
    console.error(value);
    return syntaxQuote(value);
}
