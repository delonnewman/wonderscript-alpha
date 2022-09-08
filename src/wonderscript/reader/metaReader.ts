import {_read} from "./read";
import {isMap, resetMeta} from "../lang/runtime";
import {isSymbol} from "../lang/Symbol";
import {TAG_KEY} from "./core";
import {isKeyword} from "../lang/Keyword";
import {isMeta} from "../lang/Meta";

export function metaReader(r, hat, opts) {
    let meta = _read(r, true, null, true, opts);
    if (isSymbol(meta)) {
        meta = new Map([[TAG_KEY, meta]]);
    }
    else if (isKeyword(meta)) {
        meta = new Map([[meta, true]]);
    }
    else if (!isMap(meta)) {
        throw new Error('Metadata must be a Symbol, Keyword, String or Map');
    }

    const value = _read(r, true, null, true, opts);
    if (isMeta(value)) {
        resetMeta(value, meta);
    }

    return value;
}
