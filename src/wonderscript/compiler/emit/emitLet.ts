import {Env} from "../Env";
import {isString} from "../../lang/runtime";
import {escapeChars} from "../utils";
import {compileBody} from "./compileBody";
import {emit} from "../emit";

export function emitLet(form, scope: Env): string {
    const env = new Env(scope);

    if (form.length < 2) throw new Error('A let expression should have at least 2 elements');

    const buffer = ['(function('];
    const rest = form.slice(1);
    const binds = rest[0];
    const body = rest.slice(1);

    // add names to function scope
    const names = [];
    for (let i = 0; i < binds.length; i += 2) {
        if (!isString(binds[i])) throw new Error('Invalid binding name');
        const bind = escapeChars(binds[i]);
        env.define(bind, true);
        names.push(bind);
    }

    buffer.push(names.join(', '));
    buffer.push('){');

    // body
    buffer.push(compileBody(body, env));
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
