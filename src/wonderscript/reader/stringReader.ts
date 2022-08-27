import {PushBackReader} from "./PushBackReader";

export function stringReader(r: PushBackReader, doublequote, opts): ['quote', string] {
    const buff = [];

    for (let ch = r.read(); ch !== '"'; ch = r.read()) {
        if (ch === null) throw new Error('EOF while reading string');
        if (ch === '\\') { // escape
            ch = r.read();
            if (ch === null) throw new Error('EOF while reading string');
            switch (ch) {
                case 't':
                    ch = '\t';
                    break;
                case 'r':
                    ch = '\r';
                    break;
                case 'n':
                    ch = '\n';
                    break;
                case '\\':
                    break;
                case '"':
                    break;
                case 'b':
                    ch = '\b';
                    break;
                case 'f':
                    ch = '\f';
                    break;
                case 'u':
                    // TODO: add Unicode support
                    throw new Error("Don't know how to read unicode yet");
                default:
                    // TODO: complete this
                    throw new Error("Unsupported escape character: " + ch);
            }
        }
        buff.push(ch);
    }

    return ['quote', buff.join('')];
}
