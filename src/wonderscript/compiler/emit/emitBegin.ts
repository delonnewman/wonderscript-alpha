import {emit} from "../emit";
import {emitTailPosition} from "./emitTailPosition";
import {str} from "../../lang/runtime";
import {Context} from "../../lang/Context";
import {Form, isTaggedValue} from "../core";
import {BEGIN_SYM as BEGIN_STR} from "../constants";
import {prStr} from "../prStr";
import {Symbol} from "../../lang/Symbol";

export const BEGIN_SYM = Symbol.intern(BEGIN_STR);

export type BeginForm = [typeof BEGIN_SYM, ...Form[]];

export const isBeginForm = (form: Form): form is BeginForm =>
    isTaggedValue(form) && form[0].equals(BEGIN_SYM);

export function emitBegin(form: Form, ctx: Context): string {
    if (!isBeginForm(form)) throw new Error(`invalid ${BEGIN_SYM} form: ${prStr(form)}`);

    const exprs = form.slice(0, form.length - 1).slice(1);
    const buffer = [];
    const last = form[form.length - 1];

    for (let i = 0; i < exprs.length; ++i) {
        buffer.push(emit(exprs[i], ctx));
    }

    buffer.push(emitTailPosition(last, ctx));

    if (ctx.isWithinFn() || ctx.isWithinCond()) {
        return `${buffer.join(';')};`;
    }

    return `(function(){ ${buffer.join(';')}; }())`;
}
