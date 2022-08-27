import {str} from "../../lang/runtime";
import {CURRENT_NS} from "../vars";

export function emitKeyword(kw) {
    let name = '' + kw[1];
    if (name.startsWith(':')) {
        name = str(CURRENT_NS.value.name, '/', name.slice(1));
    }
    return JSON.stringify(name);
}
