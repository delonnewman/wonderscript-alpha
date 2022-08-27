import {PushBackReader} from "../reader/PushBackReader";
import {EOF, isEOF, isTaggedValue, stacktrace} from "./core";
import {read} from "../reader/read";
import {emit} from "./emit";
import {Env} from "./Env";

export function evalString(s: string, scope: Env, src = 'inline') {
    const r = new PushBackReader(s);
    let ret, evalingTaggedValue = false;
    const stack = [];
    while (true) {
        //console.log('line before: ', r.line());
        const res = read(r, { eofIsError: false, eofValue: EOF });
        //console.log('line after: ', r.line());
        //console.log(prStr(res), str(src, ':', r.line()));
        if (isEOF(res)) return ret;
        if (isTaggedValue(res)) {
            evalingTaggedValue = true;
            stack.unshift([res[0], src, r.line()]);
        }
        if (res != null) {
            try {
                ret = eval(emit(res, scope));
            }
            catch (e) {
                console.error(stacktrace(stack));
                throw e;
            }
        }
        if (evalingTaggedValue) {
            evalingTaggedValue = false;
            stack.shift();
        }
    }
}
