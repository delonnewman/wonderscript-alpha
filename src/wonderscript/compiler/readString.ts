import {PushBackReader} from "../reader/PushBackReader";
import {read} from "../reader/read";
import {EOF, Form, isEOF} from "./core";

export function readString(s: string): Form[] {
    const r = new PushBackReader(s);
    const seq = [];

    while (true) {
        let res = read(r, { eofIsError: false, eofValue: EOF });
        if (isEOF(res)) return seq;
        if (res != null) seq.push(res);
    }
}
