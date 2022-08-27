import {PushBackReader} from "../reader/PushBackReader";
import {TOP_LEVEL_ENV} from "./vars";
import {EOF, isEOF, isTaggedValue, stacktrace} from "./core";
import {read} from "../reader/read";
import {emit} from "./emit";

export function evalString(s: string, src = 'inline') {
    const r = new PushBackReader(s);
    var ret, scope = TOP_LEVEL_ENV, stack = [], evalingTaggedValue = false;
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
