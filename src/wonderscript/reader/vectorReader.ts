import {readDelimitedList} from "./readDelimitedList";
import {PushBackReader} from "./PushBackReader";

export function vectorReader(r: PushBackReader, openbracket, opts): ['quote', any[]] {
    const a = readDelimitedList(']', r, true, opts);
    // return new Vector(null, a);
    // return ['array'].concat(a);
    return ['quote', a]
}
