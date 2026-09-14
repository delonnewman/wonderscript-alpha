import { PushBackReader } from "./PushBackReader";
import { _read } from "./read";
import { Symbol } from "../lang/Symbol";
import { Form, isTaggedValue, TaggedValue } from "../compiler/core";
import { UNQUOTE_SPLICING_SYM, UNQUOTE_SYM } from "./unquoteReader";
import { SEND_SYM } from "../compiler/emit/emitSend";

export const QUOTE_SYM = Symbol.intern('quote');
export const ARRAY_SYM = Symbol.intern('array');

function isUnquoteSplicing(form: Form): form is TaggedValue {
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

        const indexes: number[] = [0];
        for (let i = 0; i < quoted.length; i++) {
            const val = quoted[i];
            if (isUnquoteSplicing(val)) {
                quoted[i] = val[1];
                indexes.push(i);
            }
        }

        if (indexes.length === 1) {
            return [ARRAY_SYM].concat(quoted);
        }
        if (indexes[indexes.length - 1] !== quoted.length - 1) {
            indexes.push(quoted.length - 1);
        }

        const slices: unknown[][] = [];
        for (let i = 0; i < indexes.length; i++) {
            slices.push(quoted.slice(indexes[i], indexes[i + 1]));
        }

        return [SEND_SYM,
            [ARRAY_SYM, ...slices[0]],
            [Symbol.intern('concat'), ...slices.slice(1).map((it) => [ARRAY_SYM, ...it])]
        ];
    }
    if (value instanceof Symbol) {
        return [QUOTE_SYM, value];
    }
    return value as Form;
}

export function syntaxQuoteReader(r: PushBackReader, _: unknown, opts: Record<string, unknown>): unknown {
    const value = _read(r, true, null, true, opts);
    return syntaxQuote(value);
}
