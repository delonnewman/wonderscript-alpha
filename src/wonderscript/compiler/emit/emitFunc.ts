import {escapeChars} from "../utils";
import {isSymbol} from "../core";
import {isArray, map, str} from "../../lang/runtime";
import {COND_SYM, FN_SYM, RECUR_SYM} from "../constants";
import {define, env, Env} from "../Env";
import {compileBody, compileRecursiveBody} from "./compileBody";

function parseArgs(args) {
    var splat = false, name, argsBuf = [];
    for (var i = 0; i < args.length; ++i) {
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
    var argsAssign = [], i;
    for (i = 0; i < argsBuf.length; ++i) {
        if (argsBuf[i].splat) {
            argsAssign.push(str('var ', argsBuf[i].name, " = Array.prototype.slice.call(arguments, ", i, ")"));
        }
    }
    return argsAssign.join('');
}

function genArgsDef(argsBuf) {
    var i, argsDef = [];
    for (i = 0; i < argsBuf.length; ++i) {
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

export function emitFunc(form, scope: Env): string {
    var env_ = env(env_),
        args = form[1],
        argsDef, argsAssign, argsBuf, expr, i, value;

    if (form.length < 2)
        throw new Error("a function requires at least an arguments list and a body");
    else {
        if (!isArray(args)) throw new Error("an arguments list is required");

        argsBuf = parseArgs(args);
        argsAssign = genArgAssigns(argsBuf);
        argsDef = genArgsDef(argsBuf);

        for (i = 0; i < argsBuf.length; i++) {
            define(env_, argsBuf[i].name, true);
        }

        var buf = [argsAssign],
            body = form.slice(2),
            names = map(function(x) { return x.name; }, argsBuf);

        if (hasTailCall(body)) {
            buf.push(compileRecursiveBody(body, names, env_));
        }
        else if (body.length === 0) {
            buf = [];
        }
        else {
            buf.push(compileBody(body, env_));
        }

        return str("(function(", argsDef, ") { ", buf.join('; '), "; })");
    }
}
