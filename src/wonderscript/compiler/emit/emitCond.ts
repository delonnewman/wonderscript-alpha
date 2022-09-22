import {isBoolean, partition, rest, str} from "../../lang/runtime";
import {emitTailPosition} from "./emitTailPosition";
import {emit} from "../emit";
import {Context} from "../../lang/Context";
import {Form, isTaggedValue, isThrowForm} from "../core";
import {COND_SYM as COND_STR} from "../constants";
import {prStr} from "../prStr";
import {Symbol} from "../../lang/Symbol";
import {isNil} from "../../lang/Nil";

export const COND_SYM = Symbol.intern<typeof COND_STR>(COND_STR);
export const ELSE_SYM = Symbol.intern<'else'>('else');

export type CondForm = [typeof COND_SYM, ...Form[]];

export const isCondForm = (form: any): form is CondForm =>
    isTaggedValue(form, COND_SYM) && form.length >= 3;

export function emitCond(form: Form, env: Context): string {
    if (!isCondForm(form)) throw new Error(`invalid ${COND_SYM} form: ${prStr(form)}`);

    const others = form.slice(1);
    if (others.length % 2 !== 0) {
        throw new Error(`the number of body expressions should be even, found ${others.length}`);
    }

    if (others.length === 2 || others.length === 4 && ELSE_SYM.equals(others[2]) && !isThrowForm(others[3])) {
        const [pred, consequent, _, alternate] = others;
        return `${emit(pred, env)}?(${emit(consequent, env)}):(${emit(alternate ?? null, env)})`;
    }

    const exprs = partition(2, others);
    const buffer = [];

    for (let i = 0; i < exprs.length; ++i) {
        const cond = i === 0 ? 'if' : 'else if';
        if (ELSE_SYM.equals(exprs[i][0])) {
            buffer.push(str('else { ', emitTailPosition(exprs[i][1], env), ' }'));
        }
        else {
            const x = emit(exprs[i][0], env);
            const test = isBoolean(exprs[i][0]) || isNil(exprs[i][0]) ? `(${x})` : `(${x}!=null&&${x}!==false)`;
            buffer.push(str(cond, test, '{ ', emitTailPosition(exprs[i][1], env), ' }'));
        }
    }

    return str('(function(){ ', buffer.join(' '), '}())');
}
