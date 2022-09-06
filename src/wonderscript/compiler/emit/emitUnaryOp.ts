import {Form, isTaggedValue} from "../core";
import {emit} from "../emit";
import {Env} from "../Env";
import {prStr} from "../prStr";

export type UnaryOpForm = [string, Form];

export const isUnaryOpForm = (form: Form): form is UnaryOpForm =>
    isTaggedValue(form) && form.length === 2;

export function emitUnaryOp(form: Form, env: Env, op: string): string {
    if (!isUnaryOpForm(form)) throw new Error(`invalid unary operator form: ${prStr(form)}`)

    return `${op}(${emit(form[1], env)})`;
}