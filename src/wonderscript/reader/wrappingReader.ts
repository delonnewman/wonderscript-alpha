import {_read} from "./read";

export function wrappingReader(sym) {
    return function(r, quote, opts) {
        var x = _read(r, true, null, true, opts);
        //return list(sym, x);
        return [sym, x];
    };
}
