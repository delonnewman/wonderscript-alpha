import {PushBackReader} from "../reader/PushBackReader";
import {EOF, isEOF, isTaggedValue} from "./core";
import {read} from "../reader/read";
import {emit} from "./emit";
import {Context} from "../lang/Context";
import {str} from "../lang/runtime";
import {prStr} from "./prStr";

function stacktrace(stack): string {
    const buffer = [];

    for (let i = 0; i < stack.length; i++) {
        const frame = stack[i];
        buffer.push(str(frame[0], ' - ', frame[1], ':', frame[2]));
    }

    return buffer.join('\n');
}

export function evalString(s: string, scope: Context, src = 'inline') {
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
            stack.unshift([prStr(res), src, r.line()]);
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
