import {readDelimitedList} from "./readDelimitedList";
import {PushBackReader} from "./PushBackReader";

export function mapReader(r: PushBackReader, openbracket, opts): Map<any, any> {
    const a = readDelimitedList('}', r, true, opts);
    const map = new Map();

    for (let i = 0; i < a.length; i += 2) {
        const key = a[i];
        const val = a[i + 1];
        map.set(key, val);
    }

    return map;
}
