import {map, str} from "../../lang/runtime";
import {emit} from "../emit";

function emitMapEntry(env) {
    return function(entry) {
        return str('[', emit(entry[0], env), ', ', emit(entry[1], env), ']');
    };
}

export function emitMap(m, env) {
    return str('(new Map([', map(emitMapEntry(env), m).join(', '), ']))');
}

