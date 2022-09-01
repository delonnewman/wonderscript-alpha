import {escapeChars} from "../utils";
import {isSymbol} from "../core";
import {isArray, map, str} from "../../lang/runtime";
import {COND_SYM, FN_SYM, RECUR_SYM} from "../constants";
import {Env} from "../Env";
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
    const env = new Env(scope);
    const args = form[1];

    if (form.length < 2) {
        throw new Error("a function requires at least an arguments list and a body");
    }

    if (!isArray(args)) throw new Error("an arguments list is required");

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
