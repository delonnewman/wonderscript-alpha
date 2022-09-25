import {Form, isTaggedValue} from "../core";
import {JS_SYM as JS_STR} from "../constants";
import {isString} from "../../lang/runtime";
import {prStr} from "../prStr";
import {Symbol} from "../../lang/Symbol";
import {Context} from "../../lang/Context";
import {emit} from "../emit";

export const JS_SYM = Symbol.intern(JS_STR);

export type JSForm = [typeof JS_SYM, ...Form[]];

export const isJSForm = (form: Form): form is JSForm =>
    isTaggedValue(form) && form[0].equals(JS_SYM);

export function emitJS(form: Form, ctx: Context): string {
    if (!isJSForm(form)) throw Error(`invalid ${JS_SYM} form: ${prStr(form)}`);

    const forms = form.slice(1);
    const buffer = [];

    for (form of forms) {
        const str = isString(form) ? form : emit(form, ctx);
        buffer.push(str);
    }

    return buffer.join('');
}