import {map, str} from "../../lang/runtime";
import {emit} from "../emit";
import {Env} from "../Env";

function emitMapEntry(env: Env) {
    return function(entry: [any, any]): string {
        return str('[', emit(entry[0], env), ', ', emit(entry[1], env), ']');
    };
}

export function emitMap(m: Map<any, any>, env: Env): string {
    return str('(new Map([', map(emitMapEntry(env), m).join(', '), ']))');
}

