import { PushBackReader } from "./PushBackReader";
import { _read } from "./read";
import { Symbol } from "../lang/Symbol";
import { Form, isTaggedValue, TaggedValue } from "../compiler/core";
import { UNQUOTE_SPLICING_SYM, UNQUOTE_SYM } from "./unquoteReader";
import { SEND_SYM } from "../compiler/emit/emitSend";
import { p, pt } from "../util";

export const QUOTE_SYM = Symbol.intern('quote');
export const ARRAY_SYM = Symbol.intern('array');

function isUnquoteSplicing(form: unknown): form is TaggedValue {
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
        if (value.length === 0) return value;
        if (value.length === 1 && isUnquoteSplicing(value[0])) {
            return value[0][1];
        }

        // pt('value', value);
        const quoted = value.map(syntaxQuote);
        // pt('quoted', quoted);
        const indexes: number[] = [0];
        for (let i = 0; i < quoted.length; i++) {
            const val = quoted[i];
            if (isUnquoteSplicing(val)) {
                quoted[i] = val;
                indexes.push(i);
                indexes.push(i + 1);
            }
        }

        if (indexes.length === 1) {
            return [ARRAY_SYM].concat(quoted);
        }
        if (indexes[indexes.length - 1] < quoted.length - 1) {
            indexes.push(quoted.length - 1);
        }
        // pt('indexes', indexes);

        const slices: unknown[][] = [];
        for (let i = 0; i < indexes.length; i += 1) {
            const a = indexes[i];
            const b = indexes[i + 1];
            slices.push(quoted.slice(a, b));
            // if (b >= indexes.length) break;
        }
        // pt('slices', slices);

        const rest = slices.slice(1).map(it => isUnquoteSplicing(it[0]) ? it[0][1] : [ARRAY_SYM, ...it]);
        const form: Form = [SEND_SYM,
            [ARRAY_SYM, ...slices[0]],
            [Symbol.intern('concat'), ...rest]
        ];
        // pt('form', form);
        return form;
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
