import {isBoolean, partition, rest, str} from "../../lang/runtime";
import {emitTailPosition} from "./emitTailPosition";
import {emit} from "../emit";
import {Context} from "../../lang/Context";
import {Form, isTaggedValue, isThrow} from "../core";
import {COND_SYM as COND_STR} from "../constants";
import {prStr} from "../prStr";
import {Symbol} from "../../lang/Symbol";
import {isNil} from "../../lang/Nil";

export const COND_SYM = Symbol.intern(COND_STR);
export const ELSE_SYM = Symbol.intern('else');

export type CondForm = [typeof COND_SYM, ...Form[]];

export const isCondForm = (form: any): form is CondForm =>
    isTaggedValue(form) && form[0].equals(COND_SYM) && form.length >= 3;

export function emitCond(form: Form, ctx: Context): string {
    if (!isCondForm(form)) throw new Error(`invalid ${COND_SYM} form: ${prStr(form)}`);

    const others = rest(form);
    if (others.length % 2 !== 0) {
        throw new Error(`the number of body expressions should be even, found ${others.length}`);
    }

    if (others.length === 2 || others.length === 4 && ELSE_SYM.equals(others[2]) && !isThrow(others[3])) {
        const [pred, consequent, _, alternate] = others;
        return `${emit(pred, ctx)}?(${emit(consequent, ctx)}):(${emit(alternate ?? null, ctx)})`;
    }

    ctx.setWithinCond(); // only set within conds with self-calling functions

    const exprs = partition(2, others);
    const buffer = [];

    for (let i = 0; i < exprs.length; ++i) {
        const cond = i === 0 ? 'if' : 'else if';
        if (ELSE_SYM.equals(exprs[i][0])) {
            buffer.push(str('else { ', emitTailPosition(exprs[i][1], ctx), ' }'));
        }
        else {
            const x = emit(exprs[i][0], ctx);
            const test = isBoolean(exprs[i][0]) || isNil(exprs[i][0]) ? `(${x})` : `(${x}!=null&&${x}!==false)`;
            buffer.push(str(cond, test, '{ ', emitTailPosition(exprs[i][1], ctx), ' }'));
        }
    }

    return str('(function(){ ', buffer.join(' '), '}())');
}
