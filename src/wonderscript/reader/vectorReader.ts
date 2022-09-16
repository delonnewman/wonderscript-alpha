import {readDelimitedList} from "./readDelimitedList";
import {PushBackReader} from "./PushBackReader";
import {Vector} from "../lang/Vector";

export function vectorReader(r: PushBackReader, openbracket, opts): Vector {
    const a = readDelimitedList(']', r, true, opts);

    return new Vector(a);
}
