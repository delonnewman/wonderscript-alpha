import {Context} from "../../lang/Context";
import {isArray, isString} from "../../lang/runtime";
import {escapeChars} from "../utils";
import {compileRecursiveBody} from "./compileBody";
import {emit} from "../emit";
import {LOOP_SYM as LOOP_STR} from "../constants";
import {BodyForm, isBodyForm} from "../core";
import {prStr} from "../prStr";
import {isSymbol, Symbol} from "../../lang/Symbol";

export const LOOP_SYM = Symbol.intern(LOOP_STR);

export type LoopForm = BodyForm<typeof LOOP_SYM>;

export const isLoopForm = isBodyForm<typeof LOOP_SYM>(LOOP_SYM);

// TODO: generalize body form emitters
export function emitLoop(form, scope: Context): string {
    if (!isLoopForm(form)) throw new Error(`invalid ${LOOP_SYM} form: ${prStr(form)}`);
    const env = Context.withinLoop(scope);

    const buffer = ['(function('];
    const binds = form[1];
    const body = form.slice(2);

    const names = [];
    for (let i = 0; i < binds.length; i += 2) {
        if (!isSymbol(binds[i])) throw new Error('Invalid binding name');
        env.define(binds[i], true);

        const bind = escapeChars(binds[i].name());
        names.push(bind);
    }
    buffer.push(names.join(', '));
    buffer.push('){');

    // body
    buffer.push(compileRecursiveBody(body, names, env));
    buffer.push('}(');

    // add values to function scope
    const values = [];
    for (let i = 0; i < binds.length; i += 2) {
        values.push(emit(binds[i + 1], env));
    }
    buffer.push(values.join(', '));
    buffer.push('))');

    return buffer.join('');
}
