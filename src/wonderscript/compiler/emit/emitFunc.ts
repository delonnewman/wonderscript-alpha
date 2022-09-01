import {escapeChars} from "../utils";
import {Form, isSymbol, isTaggedValue} from "../core";
import {isArray, map, str} from "../../lang/runtime";
import {COND_SYM, FN_SYM, RECUR_SYM} from "../constants";
import {Env} from "../Env";
import {compileBody, compileRecursiveBody} from "./compileBody";
import {prStr} from "../prStr";

function parseArgs(args) {
    let splat = false, name;
    const argsBuf = [];
    for (let i = 0; i < args.length; ++i) {
        if ( !isSymbol(args[i]) ) continue;
        if ( args[i].startsWith('&') ) {
            name = args[i].replace(/^&/, '');
            splat = true;
        }
        else {
            name = args[i];
        }
        argsBuf.push({name: escapeChars(name), order: i, splat: splat});
    }
    return argsBuf;
}

function genArgAssigns(argsBuf) {
    const argsAssign = [];
    for (let i = 0; i < argsBuf.length; ++i) {
        if (argsBuf[i].splat) {
            argsAssign.push(str('var ', argsBuf[i].name, " = Array.prototype.slice.call(arguments, ", i, ")"));
        }
    }
    return argsAssign.join('');
}

function genArgsDef(argsBuf) {
    const argsDef = [];
    for (let i = 0; i < argsBuf.length; ++i) {
        argsDef.push(argsBuf[i].name);
    }
    return argsDef.join(',');
}

function hasTailCall(form) {
    if (isArray(form) && form[0] === RECUR_SYM) {
        return true;
    }
    else if (isArray(form) && form[0] === COND_SYM) {
        return form.slice(1).some(hasTailCall);
    }
    else if (isArray(form) && form[0] === FN_SYM) {
        return form.slice(2).some(hasTailCall);
    }
    else if (isArray(form)) {
        return form.some(hasTailCall);
    }
    else {
        return false;
    }
}

export type FnForm = [typeof FN_SYM, any[], ...any[]];

export const isFnForm = (form: Form): form is FnForm =>
    isTaggedValue(form) && form[0] === FN_SYM && isArray(form[1]);

export function emitFunc(form: Form, scope: Env): string {
    if (!isFnForm(form)) throw new Error(`invalid ${FN_SYM} form: ${prStr(form)}`)

    const env = new Env(scope);
    const args = form[1];

    const argsBuf = parseArgs(args);
    const argsAssign = genArgAssigns(argsBuf);
    const argsDef = genArgsDef(argsBuf);

    for (let i = 0; i < argsBuf.length; i++) {
        env.define(argsBuf[i].name, true);
    }

    let buffer = [argsAssign];
    const body = form.slice(2);
    const names = map((x) => x.name, argsBuf);

    if (hasTailCall(body)) {
        buffer.push(compileRecursiveBody(body, names, env));
    } else if (body.length === 0) {
        buffer = [];
    } else {
        buffer.push(compileBody(body, env));
    }

    return str("(function(", argsDef, ") { ", buffer.join('; '), "; })");
}
