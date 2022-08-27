import {define, Env, env} from "../Env";
import {isString} from "../../lang/runtime";
import {escapeChars} from "../utils";
import {compileBody} from "./compileBody";
import {emit} from "./index";

export function emitLet(form, scope: Env): string {
    var env_ = env(scope);

    if (form.length < 2) throw new Error('A let expression should have at least 2 elements');
    var i, bind,
        buff = ['(function('],
        rest = form.slice(1),
        binds = rest[0],
        body = rest.slice(1);

    // add names to function scope
    var names = [];
    for (i = 0; i < binds.length; i += 2) {
        if (!isString(binds[i]))
            throw new Error('Invalid binding name');
        bind = escapeChars(binds[i]);
        define(env_, bind, true);
        names.push(bind);
    }
    buff.push(names.join(', '));
    buff.push('){');

    // body
    buff.push(compileBody(body, env_));
    buff.push('}(');

    // add values to function scope
    var values = [];
    for (i = 0; i < binds.length; i += 2) {
        values.push(emit(binds[i + 1], env_));
    }
    buff.push(values.join(', '));
    buff.push('))');

    return buff.join('');
}
