import {readDelimitedList} from "./readDelimitedList";
import {PushBackReader} from "./PushBackReader";

export function listReader(r: PushBackReader, _: '(', opts) {
    /*var meta = arrayMap(
        Keyword.intern('line'), r.line(),
        Keyword.intern('column'), r.column()
    );*/
    const a = readDelimitedList(')', r, true, opts);
    //return list.apply(null, a).withMeta(meta);
    return a;
}
