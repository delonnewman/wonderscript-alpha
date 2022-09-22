import {escapeChars} from "../utils";
import {BodyForm, Form, isBodyForm, isRecurForm, isTaggedValue} from "../core";
import {isArray, map, str} from "../../lang/runtime";
import {FN_SYM as FN_STR} from "../constants";
import {Context} from "../../lang/Context";
import {compileBody, compileRecursiveBody} from "./compileBody";
import {prStr} from "../prStr";
import {isSymbol, Symbol} from "../../lang/Symbol";
import {isCondForm} from "./emitCond";

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

export const FN_SYM = Symbol.intern<typeof FN_STR>(FN_STR);
export type FnForm = [typeof FN_SYM, Symbol, Symbol[], ...Form[]] | [typeof FN_SYM, Symbol[], ...Form[]];

export const isFnForm = (form: Form): form is FnForm => {
    if (!isTaggedValue<typeof FN_SYM>(form, FN_SYM)) return false;
    if (!isSymbol(form[1]) && !isArray(form[1])) return false;
    if (isSymbol(form[1]) && !isArray(form[2])) return false;

    return true;
}


function hasTailCall(form: Form): boolean {
    if (isRecurForm(form)) {
        return true;
    }
    else if (isCondForm(form)) {
        return form.slice(1).some(hasTailCall);
    }
    else if (isFnForm(form)) {
        return form.slice(2).some(hasTailCall);
    }
    else if (isArray(form)) {
        return form.some(hasTailCall);
    }
    else {
        return false;
    }
}

export function emitFunc(form: Form, context: Context): string {
    if (!isFnForm(form)) throw new Error(`invalid ${FN_SYM} form: ${prStr(form)}`)

    const ctx = new Context(context);
    const name = isSymbol(form[1]) ? form[1] : null
    const args = (name ? form[2] : form[1]) as Symbol[]
    const body = name ? form.slice(3) : form.slice(2);

    const argsBuf    = parseArgs(args);
    const argsAssign = genArgAssigns(argsBuf);
    const argsDef    = genArgsDef(argsBuf);

    for (let i = 0; i < argsBuf.length; i++) {
        ctx.define(argsBuf[i].name, true);
    }

    let buffer = argsAssign ? [argsAssign] : [];
    const names = map((x) => x.name, argsBuf);

    if (hasTailCall(body)) {
        buffer.push(compileRecursiveBody(body, names, ctx));
    } else if (body.length === 0) {
        buffer = [];
    } else {
        buffer.push(compileBody(body, ctx));
    }


    if (name) {
        return `(function ${name}(${argsDef}){${buffer.join('; ')};})`;
    }

    return `(function(${argsDef}){${buffer.join('; ')};})`;
}
