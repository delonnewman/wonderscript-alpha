import {PushBackReader} from "./PushBackReader";

export function commentReader(r: PushBackReader, semicolon, opts) {
    let ch;

    do {
        ch = r.read();
    } while (ch !== null && ch !== '\n' && ch !== '\r');

    return r;
}
