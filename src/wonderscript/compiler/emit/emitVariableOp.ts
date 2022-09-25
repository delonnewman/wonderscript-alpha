import {emit} from "../emit";
import {Context} from "../../lang/Context";
import {Form, isTaggedValue} from "../core";
import {prStr} from "../prStr";
import {PLUS_SYM as PLUS_STR, MULT_SYM as MULT_STR, MINUS_SYM as MINUS_STR} from "../constants";
import {Symbol} from "../../lang/Symbol";

export const PLUS_SYM  = Symbol.intern<typeof PLUS_STR>(PLUS_STR);
export const MULT_SYM  = Symbol.intern<typeof MULT_STR>(MULT_STR);
export const MINUS_SYM = Symbol.intern<typeof MINUS_STR>(MINUS_STR);

const ONE = "1";
const ZERO = "0";

export function emitVariableOp(form: Form, env: Context, op = form[0]): string {
    if (!isTaggedValue(form)) throw new Error(`invalid variable operator form: ${prStr(form)}`);

    if (form.length === 1 && PLUS_SYM.equals(form[0])) {
        return ZERO;
    }

    if (form.length === 1 && MULT_SYM.equals(form[0])) {
        return ONE;
    }

    if (form.length === 1) {
        throw new Error('wrong number of arguments, expected at least 1 got 0');
    }

    if (form.length === 2 && MINUS_SYM.equals(form[0])) {
        return `-${form[1]}`;
    }

    if (form.length === 2) {
        return `${form[1]}`;
    }

    const values = form.slice(1);
    const valBuffer = [];

    for (let i = 0; i < values.length; ++i) {
        valBuffer.push(emit(values[i], env));
    }

    return `(${valBuffer.join(op)})`;
}
