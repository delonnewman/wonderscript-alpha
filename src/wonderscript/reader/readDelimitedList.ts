import {getMacro, isWhitespace} from "./core";
import {_read} from "./read";
import {PushBackReader} from "./PushBackReader";

export function readDelimitedList(delim, r: PushBackReader, isRecursive: boolean, opts) {
    const firstLine = r.line();
    const a = [];

    while (true) {
        let ch = r.read();
        while (isWhitespace(ch)) {
            if (ch === '\n') r.incrementLine();
            ch = r.read();
        }

        if (ch === null) {
            throw new Error('EOF while reading, starting at line: ' + firstLine);
        }

        if (ch === delim) break;

        const macro = getMacro(ch);
        if (macro !== null) {
            const ret = macro(r, ch, opts);
            // no op macros return the reader
            if (ret !== r) a.push(ret);
        }
        else {
            r.unread(ch);
            const x = _read(r, true, null, isRecursive, opts);
            if (x !== r) a.push(x);
        }
    }

    return a;
}
