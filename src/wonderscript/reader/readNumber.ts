import {isMacro, isWhitespace} from "./core";
import {PushBackReader} from "./PushBackReader";

export function readNumber(r: PushBackReader, initch: string): number {
    const buff = [initch];

    while (true) {
        const ch = r.read();
        if (ch === null || isWhitespace(ch) || isMacro(ch)) {
            r.unread(ch);
            break;
        }
        buff.push(ch);
    }

    const s = buff.join('');
    const n = matchNumber(s);
    if (n === null) throw new Error('invalid number: ' + s);
    return n;
}

// TODO: add rationals, bigints?
function matchNumber(s: string): number | null {
    const m = s.match(/[\-+]?(\d[\d|_]*(\.\d+)?([eE]-?\d+)?)/);
    if (m == null) return null;

    if (s.indexOf('_') !== -1) {
        s = s.replace(/_/g, '');
    }

    if (s.indexOf('.') === -1) {
        return parseInt(s, 10);
    }

    return parseFloat(s);
}
