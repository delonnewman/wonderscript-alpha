import {emit} from "../emit";
import {emitTailPosition} from "./emitTailPosition";
import {str} from "../../lang/runtime";
import {Env} from "../Env";
import {Form, isTaggedValue} from "../core";
import {BEGIN_SYM as BEGIN_STR} from "../constants";
import {prStr} from "../prStr";
import {Symbol} from "../../lang/Symbol";

export const BEGIN_SYM = Symbol.intern(BEGIN_STR);

export type BeginForm = [typeof BEGIN_SYM, ...Form[]];

export const isBeginForm = (form: Form): form is BeginForm =>
    isTaggedValue(form) && form[0].equals(BEGIN_SYM);

export function emitBegin(form: Form, env: Env): string {
    if (!isBeginForm(form)) throw new Error(`invalid ${BEGIN_SYM} form: ${prStr(form)}`);

    const exprs = form.slice(0, form.length - 1).slice(1);
    const buffer = [];
    const last = form[form.length - 1];

    for (let i = 0; i < exprs.length; ++i) {
        buffer.push(emit(exprs[i], env));
    }

    buffer.push(emitTailPosition(last, env));

    return str("(function(){ ", buffer.join('; '), "; }())");
}
