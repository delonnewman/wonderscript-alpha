import {readDelimitedList} from "./readDelimitedList";
import {PushBackReader} from "./PushBackReader";

export function setReader(r: PushBackReader, leftbracket, opts): ReadonlySet<any> {
    const array = readDelimitedList('}', r, true, opts);
    return Object.freeze(new Set(array));
}
