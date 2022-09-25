import {emit} from "../emit";
import {Context} from "../../lang/Context";
import {Form, isTaggedValue} from "../core";
import {IF_SYM as IF_STR} from "../constants";
import {prStr} from "../prStr";
import {Symbol} from "../../lang/Symbol";
import {isThrowForm} from "./emitThrownException";
import {FN_SYM} from "./emitFunc";

export const IF_SYM = Symbol.intern<typeof IF_STR>(IF_STR);

export type IfForm = [typeof IF_SYM, Form, Form, Form?];

export const isIfForm = (form: any): form is IfForm =>
    isTaggedValue(form, IF_SYM) && form.length >= 3;

export function emitIf(form: Form, env: Context): string {
    if (!isIfForm(form)) throw new Error(`invalid ${IF_SYM} form: ${prStr(form)}`);

    let [_, pred, consequent, alternate] = form;

    if (isThrowForm(consequent)) {
       consequent = [[FN_SYM, [], consequent]];
    }

    if (isThrowForm(alternate)) {
        alternate = [[FN_SYM, [], alternate]];
    }

    return `(${emit(pred, env)}?(${emit(consequent, env)}):(${emit(alternate ?? null, env)}))`;
}
