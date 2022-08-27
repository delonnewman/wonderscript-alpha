import {_read} from "./read";
import {PushBackReader} from "./PushBackReader";

const THE_VAR = 'the-var';

export function varReader(r: PushBackReader, quote, opts) {
    const x = _read(r, true, null, true, opts);
    //return list(THE_VAR, x);
    return [THE_VAR, x];
}
