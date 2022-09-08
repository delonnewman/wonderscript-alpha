import {emit} from "../emit";
import {Env} from "../Env";

const EMPTY_MAP = '(new Map())';

export function emitMap(m: Map<any, any>, env: Env): string {
    if (m.size === 0) return EMPTY_MAP;

    const buffer = [];
    for (let entry of m) {
        const key = emit(entry[0], env);
        const val = emit(entry[1], env);
        buffer.push(`[${key},${val}]`);
    }

    return `(new Map([${buffer.join(', ')}]))`;
}

