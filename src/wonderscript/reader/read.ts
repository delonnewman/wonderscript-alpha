import {PushBackReader} from "./PushBackReader";
import {getMacro, interpretToken, isDigit, isWhitespace} from "./core";
import {readNumber} from "./readNumber";
import {readToken} from "./readToken";

type Options = {
    eofIsError?: boolean
    eofValue?: any
}

const DefaultOptions = {
    eofIsError: true,
    eofValue: null
} as const;

export function read(r: PushBackReader, opts : Options = DefaultOptions) {
    const { eofIsError, eofValue } = opts;

    return _read(r, eofIsError, eofValue, false, opts);
}

export function _read(r, eofIsError, eofValue, isRecursive, opts) {
    while (true) {
        let ch = r.read();

        while (isWhitespace(ch)) {
            ch = r.read();
        }
        if (ch === null) {
            if (eofIsError) throw new Error('EOF while reading');
            return eofValue;
        }

        if (isDigit(ch)) {
            return readNumber(r, ch);
        }

        const macro = getMacro(ch);
        if (macro !== null) {
            const ret = macro(r, ch, opts);
            if (ret === r) continue;
            return ret;
        }

        if (ch === '+' || ch === '-') {
            const ch2 = r.read();
            if (isDigit(ch2)) {
                r.unread(ch2);
                return readNumber(r, ch);
            }
            r.unread(ch2);
        }

        const token = readToken(r, ch, true);
        return interpretToken(token);
    }
}
