import {readDelimitedList} from "./readDelimitedList";
import {PushBackReader} from "./PushBackReader";

export function listReader(r: PushBackReader, _: '(', opts) {
    return readDelimitedList(')', r, true, opts);
}
