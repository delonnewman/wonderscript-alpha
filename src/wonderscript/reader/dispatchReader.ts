import {DISPATCH_MACROS} from "./core";
import {PushBackReader} from "./PushBackReader";

export function dispatchReader(r: PushBackReader, hash, opts) {
    const ch = r.read();
    if (ch === null) throw new Error('EOF while reading character');
    const fn = DISPATCH_MACROS[ch];

    if (fn == null) {
        // TODO: implement taggedReader
        /*if (ch.match(/[A-Za-z]{1,1}/)) {
            r.unread(ch);
            return taggedReader.call(null, ch, opts);
        }*/
        throw new Error('No dispatch macro for: ' + ch);
    }

    return fn(r, ch, opts);
}
