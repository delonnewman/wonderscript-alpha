import {_read} from "./read";
import {resetMeta} from "../lang/runtime";

export function metaReader(r, hat, opts) {
    var line = r.line();
    var column = r.column();
    var meta = _read(r, true, null, true, opts);
    // FIXME: we probably don't have any use for tags
    //if (isSymbol(meta) || isString(meta)) {
    //if (isString(meta)) {
    //meta = arrayMap(TAG_KEY, meta);
    //    meta = {tag: meta};
    //}
    /*else if (isKeyword(meta)) {
        meta = arrayMap(meta, true);
    }
    else if (!isMap(meta)) {
        throw new Error('Metadata must be a Symbol, Keyword, String or Map');
    }*/
    var x = _read(r, true, null, true, opts);
    resetMeta(x, meta);
    return x;
    /*
    if (isa(x, IMeta)) {
        if (isSeq(x)) {
            meta = meta.assoc([LINE_KEY, line, COLUMN_KEY, column]);
        }
        if (isa(x, AReference)) {
            x.resetMeta(meta);
            return x;
        }

        var xmeta = x.meta();
        for (var s = meta.entries(); s !== null; s = s.next()) {
            var kv = s.first();
            xmeta = xmeta.assoc([key(kv), val(kv)]);
        }
        return x.withMeta(xmeta);
    }
    else {
        throw new Error('Metadata can only be applied to IMetas');
    }
    */
}
