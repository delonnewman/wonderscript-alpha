import {escapeChars} from "../utils";
import {BodyForm, Form, isBodyForm} from "../core";
import {isArray, map, str} from "../../lang/runtime";
import {COND_SYM, FN_SYM, RECUR_SYM} from "../constants";
import {Env} from "../Env";
import {compileBody, compileRecursiveBody} from "./compileBody";
import {prStr} from "../prStr";
import {isSymbol, Symbol} from "../../lang/Symbol";

const SPLAT = '&';

type ParsedArgs = Array<{
    name: string,
    order: number,
    splat: boolean
}>

function parseArgs(args: Symbol[]): ParsedArgs {
    let splat = false, name;
    const parsed: ParsedArgs = [];

    for (let i = 0; i < args.length; ++i) {
        if ( !isSymbol(args[i]) ) continue; // TODO: probably should throw and error instead

        if ( args[i].name().startsWith(SPLAT) ) {
            name = args[i].name().slice(1);
            splat = true;
        } else {
            name = args[i].name();
        }

        parsed.push({name: escapeChars(name), order: i, splat: splat});
    }

    return parsed;
}

function genArgAssigns(argsBuf: ParsedArgs): string {
    const argsAssign = [];
    for (let i = 0; i < argsBuf.length; ++i) {
        if (argsBuf[i].splat) {
            argsAssign.push(str('var ', argsBuf[i].name, " = Array.prototype.slice.call(arguments, ", i, ")"));
        }
    }
    return argsAssign.join('');
}

function genArgsDef(argsBuf: ParsedArgs): string {
    const argsDef = [];
    for (let i = 0; i < argsBuf.length; ++i) {
        argsDef.push(argsBuf[i].name);
    }
    return argsDef.join(',');
}

const RECUR = Symbol.intern(RECUR_SYM)
const COND  = Symbol.intern(COND_SYM)
const FN    = Symbol.intern(FN_SYM)

function hasTailCall(form: Form): boolean {
    if (isArray(form) && RECUR.equals(form[0])) {
        return true;
    }
    else if (isArray(form) && COND.equals(form[0])) {
        return form.slice(1).some(hasTailCall);
    }
    else if (isArray(form) && FN.equals(form[0])) {
        return form.slice(2).some(hasTailCall);
    }
    else if (isArray(form)) {
        return form.some(hasTailCall);
    }
    else {
        return false;
    }
}

export type FnForm = BodyForm<Symbol<typeof FN_SYM>>;

export const isFnForm = isBodyForm<Symbol<typeof FN_SYM>>(Symbol.intern(FN_SYM));

export function emitFunc(form: Form, scope: Env): string {
    if (!isFnForm(form)) throw new Error(`invalid ${FN_SYM} form: ${prStr(form)}`)

    const env = new Env(scope);
    const args = form[1];

    const argsBuf    = parseArgs(args);
    const argsAssign = genArgAssigns(argsBuf);
    const argsDef    = genArgsDef(argsBuf);

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
