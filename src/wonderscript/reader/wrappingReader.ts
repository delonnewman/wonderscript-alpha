import {_read} from "./read";
import {Symbol} from "../lang/Symbol";
import {TaggedValue} from "../compiler/core";
import {PushBackReader} from "./PushBackReader";

export function wrappingReader(sym: Symbol) {
    return (r: PushBackReader, _, opts): TaggedValue => {
        const value = _read(r, true, null, true, opts);
        return [sym, value];
    };
}
