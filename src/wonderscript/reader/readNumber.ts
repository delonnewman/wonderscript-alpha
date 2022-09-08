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
    if (n === null) throw new Error('Invalid number: ' + s);
    return n;
}

// TODO: add decimals, _'s, scientific notation, rationals?
function matchNumber(s: string): number | null {
    const m = s.match(/(\-|\+)?\d+/);
    if (m == null) return null;

    if (s.indexOf('.') === -1) {
        return parseInt(s, 10);
    }

    return parseFloat(s);
}
