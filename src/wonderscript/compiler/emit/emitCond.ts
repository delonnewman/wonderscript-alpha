import {partition, rest, str} from "../../lang/runtime";
import {emitTailPosition} from "./emitTailPosition";
import {emit} from "./index";
import {Env} from "../Env";

export function emitCond(form, env: Env): string {
    const exprs = partition(2, rest(form));
    const buff = [];

    for (let i = 0; i < exprs.length; ++i) {
        const cond = i === 0 ? 'if' : 'else if';
        if ( exprs[i][0] === 'else' ) {
            buff.push(str('else { ', emitTailPosition(exprs[i][1], env), ' }'));
        }
        else {
            const x = emit(exprs[i][0], env);
            buff.push(str(cond, '(', x, ' != null && ', x, ' !== false){ ', emitTailPosition(exprs[i][1], env), ' }'));
        }
    }

    return str('(function(){ ', buff.join(' '), '}())');
}
