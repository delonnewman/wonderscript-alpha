import {escapeChars} from "../utils";
import {BodyForm, Form, isBodyForm} from "../core";
import {isArray, map, str} from "../../lang/runtime";
import {COND_SYM as COND_STR, FN_SYM as FN_STR, RECUR_SYM as RECUR_STR} from "../constants";
import {Context} from "../../lang/Context";
import {compileBody, compileRecursiveBody} from "./compileBody";
import {prStr} from "../prStr";
import {isSymbol, Symbol} from "../../lang/Symbol";

const SPLAT = '&';

type ParsedArgs = Array<{
    name: Symbol,
    order: number,
    splat: boolean
}>

function parseArgs(args: Symbol[]): ParsedArgs {
    let splat = false, name;
    const parsed: ParsedArgs = [];

    for (let i = 0; i < args.length; ++i) {
        // TODO: probably should throw and error instead
        // TODO: check if there's a namespace that should be an error also
        if ( !isSymbol(args[i]) ) continue;

        if ( args[i].name().startsWith(SPLAT) ) {
            name = Symbol.intern(args[i].name().slice(1));
            splat = true;
        } else {
            name = args[i];
        }

        parsed.push({name, order: i, splat});
    }

    return parsed;
}

function genArgAssigns(argsBuf: ParsedArgs): string {
    const argsAssign = [];

    for (let i = 0; i < argsBuf.length; ++i) {
        if (argsBuf[i].splat) {
            const splat = `var ${escapeChars(argsBuf[i].name.name())}=Array.prototype.slice.call(arguments, ${i})`;
            argsAssign.push(splat);
        }
    }

    return argsAssign.join('');
}

function genArgsDef(argsBuf: ParsedArgs): string {
    const argsDef = [];
    for (let i = 0; i < argsBuf.length; ++i) {
        argsDef.push(escapeChars(argsBuf[i].name.name()));
    }
    return argsDef.join(',');
}

const RECUR_SYM = Symbol.intern(RECUR_STR);
const COND_SYM  = Symbol.intern(COND_STR);
const FN_SYM    = Symbol.intern(FN_STR);

function hasTailCall(form: Form): boolean {
    if (isArray(form) && RECUR_SYM.equals(form[0])) {
        return true;
    }
    else if (isArray(form) && COND_SYM.equals(form[0])) {
        return form.slice(1).some(hasTailCall);
    }
    else if (isArray(form) && FN_SYM.equals(form[0])) {
        return form.slice(2).some(hasTailCall);
    }
    else if (isArray(form)) {
        return form.some(hasTailCall);
    }
    else {
        return false;
    }
}

export type FnForm = BodyForm<typeof FN_SYM>;

export const isFnForm = isBodyForm<typeof FN_SYM>(FN_SYM);

export function emitFunc(form: Form, scope: Context): string {
    if (!isFnForm(form)) throw new Error(`invalid ${FN_SYM} form: ${prStr(form)}`)

    const env = new Context(scope);
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
