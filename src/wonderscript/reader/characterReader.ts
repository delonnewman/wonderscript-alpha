import {readToken} from "./readToken";

export function characterReader(r, slash, opts) {
    const ch = r.read();
    if (ch === null) throw new Error('EOF while reading character');

    const token = readToken(r, ch, false);

    if (token.length === 1) return token;
    else if (token === 'newline') return '\n';
    else if (token === 'space') return ' ';
    else if (token === 'tab') return '\t';
    else if (token === 'backspace') return '\b';
    else if (token === 'formfeed') return '\f';
    else if (token === 'return') return '\r';
    else if (token.startsWith('u')) {
        throw new Error("Don't know how to read unicode characters");
    }
    else if (token.startsWith('o')) {
        throw new Error("Don't know how to read octal characters");
    }
}
