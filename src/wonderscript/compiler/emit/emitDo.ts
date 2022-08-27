import {emit} from "../emit";
import {emitTailPosition} from "./emitTailPosition";
import {str} from "../../lang/runtime";
import {Env} from "../Env";

export function emitDo(form, env: Env): string {
    var exprs = form.slice(0, form.length - 1).slice(1),
        buf = [],
        last = form[form.length - 1];

    for (let i = 0; i < exprs.length; ++i) {
        buf.push(emit(exprs[i], env));
    }
    buf.push(emitTailPosition(last, env));

    return str("(function(){ ", buf.join('; '), "; }())");
}
