import {readDelimitedList} from "./readDelimitedList";
import {PushBackReader} from "./PushBackReader";

export function setReader(r: PushBackReader, leftbracket, opts) {
    //return HashSet.createFromArray(readDelimitedList('}', r, true, opts));
    return readDelimitedList('}', r, true, opts);
}
