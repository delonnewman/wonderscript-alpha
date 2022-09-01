import {emit} from "../emit";
import {emitTailPosition} from "./emitTailPosition";
import {str} from "../../lang/runtime";
import {Env} from "../Env";
import {Form, isTaggedValue, TaggedValue} from "../core";
import {DO_SYM} from "../constants";
import {prStr} from "../prStr";

export type DoForm = TaggedValue<typeof DO_SYM>;

export const isDoForm = (form: Form): form is DoForm =>
    isTaggedValue(form) && form[0] === DO_SYM;

export function emitDo(form: Form, env: Env): string {
    if (!isDoForm(form)) throw new Error(`invalid ${DO_SYM} form: ${prStr(form)}`);

    const exprs = form.slice(0, form.length - 1).slice(1);
    const buffer = [];
    const last = form[form.length - 1];

    for (let i = 0; i < exprs.length; ++i) {
        buffer.push(emit(exprs[i], env));
    }

    buffer.push(emitTailPosition(last, env));

    return str("(function(){ ", buffer.join('; '), "; }())");
}
