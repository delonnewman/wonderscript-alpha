import {isArray, isString, map} from "../../lang/runtime";
import {emit} from "../emit";
import {Context} from "../../lang/Context";
import {NEW_SYM as NEW_STR} from "../constants";
import {Form} from "../core";
import {prStr} from "../prStr";
import {isSymbol, Symbol} from "../../lang/Symbol";

export const NEW_SYM = Symbol.intern(NEW_STR);

export type ClassInitForm = [typeof NEW_SYM, Symbol, ...Form[]];

export const isClassInitForm = (form: Form): form is ClassInitForm =>
    isArray(form) && form[0].equals(NEW_SYM) && isSymbol(form[1]);

export function emitClassInit(form, env: Context): string {
    if (!isClassInitForm(form)) throw new Error(`invalid ${NEW_SYM} form: ${prStr(form)}`);

    const args = map((arg) => emit(arg, env), form.slice(2));

    return `new ${emit(form[1], env)}(${args.join(', ')})`;
}
