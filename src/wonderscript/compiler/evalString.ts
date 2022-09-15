import {PushBackReader} from "../reader/PushBackReader";
import {EOF, isEOF, isTaggedValue} from "./core";
import {read} from "../reader/read";
import {emit} from "./emit";
import {Context} from "../lang/Context";
import {isString} from "../lang/runtime";
import {prStr} from "./prStr";
import {RuntimeError} from "../lang/RuntimeError";

export function evalString(input: string, scope: Context, source = 'inline') {
    const r = new PushBackReader(input);
    let ret;
    const stack = [];
    while (true) {
        const line = r.line();
        const res = read(r, { eofIsError: false, eofValue: EOF });
        if (isEOF(res)) return ret;
        if (isTaggedValue(res)) {
            stack.unshift([prStr(res), source, line + 1]);
        }
        if (res != null) {
            try {
                ret = eval(emit(res, scope));
            }
            catch (e) {
                if (isString(e)) {
                    throw new RuntimeError(e, stack.slice(0));
                }
                else {
                    throw e;
                }
            }
        }
    }
}
