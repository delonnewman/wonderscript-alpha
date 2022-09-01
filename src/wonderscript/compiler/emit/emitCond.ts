import {partition, rest, str} from "../../lang/runtime";
import {emitTailPosition} from "./emitTailPosition";
import {emit} from "../emit";
import {Env} from "../Env";
import {Form, isTaggedValue, TaggedValue} from "../core";
import {COND_SYM} from "../constants";
import {prStr} from "../prStr";

export type CondForm = TaggedValue<typeof COND_SYM>;

export const isCondForm = (form: any): form is CondForm =>
    isTaggedValue(form) && form[0] === COND_SYM && form.length >= 3;

export function emitCond(form: Form, env: Env): string {
    if (!isCondForm(form)) throw new Error(`invalid ${COND_SYM} form: ${prStr(form)}`);

    const others = rest(form);
    if (others.length % 2 !== 0) {
        throw new Error(`the number of body expressions should be even, found ${others.length}`);
    }

    const exprs = partition(2, others);
    const buffer = [];

    for (let i = 0; i < exprs.length; ++i) {
        const cond = i === 0 ? 'if' : 'else if';
        if (exprs[i][0] === 'else') {
            buffer.push(str('else { ', emitTailPosition(exprs[i][1], env), ' }'));
        }
        else {
            const x = emit(exprs[i][0], env);
            buffer.push(str(cond, '(', x, ' != null && ', x, ' !== false){ ', emitTailPosition(exprs[i][1], env), ' }'));
        }
    }

    return str('(function(){ ', buffer.join(' '), '}())');
}
