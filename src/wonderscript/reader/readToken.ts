import {isTerminatingMacro, isWhitespace, nonConstituent} from "./core";
import {PushBackReader} from "./PushBackReader";

export function readToken(r: PushBackReader, initch, leadConstituent) {
    if (leadConstituent && nonConstituent(initch)) {
        throw new Error('Invalid leading character: ' + initch);
    }

    const buff = [initch];
    while(true) {
        const ch = r.read();
        if (ch === null || isWhitespace(ch) || isTerminatingMacro(ch)) {
            r.unread(ch);
            return buff.join('');
        }
        else if (nonConstituent(ch)) {
            throw new Error('Invalid constituent character: ' + ch);
        }
        buff.push(ch);
    }
}
