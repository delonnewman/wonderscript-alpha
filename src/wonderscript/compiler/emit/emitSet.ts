import {emit} from "../emit";
import {Context} from "../../lang/Context";

const EMPTY_SET = '(new Set())';

export function emitSet(s: Set<any>, env: Context): string {
    if (s.size === 0) return EMPTY_SET;

    const buffer = [];
    for (let entry of s) {
        const val = emit(entry, env);
        buffer.push(val);
    }

    return `(new Set([${buffer.join(', ')}]))`;
}

