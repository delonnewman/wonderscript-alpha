import {_read} from "./read";
import {PushBackReader} from "./PushBackReader";
import {Symbol} from "../lang/Symbol";

const THE_DEF = Symbol.intern('the-def');

export function defReader(r: PushBackReader, quote, opts): [typeof THE_DEF, Symbol] {
    const x = _read(r, true, null, true, opts);
    return [THE_DEF, x];
}
