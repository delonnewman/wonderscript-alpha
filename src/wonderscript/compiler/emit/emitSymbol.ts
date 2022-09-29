import {Context} from "../../lang/Context";
import {escapeChars} from "../utils";
import {isUndefined} from "../../lang/runtime";
import {CORE_NS, CURRENT_NS} from "../vars";
import {Symbol} from "../../lang/Symbol";
import {prStr} from "../prStr";

const CTX_ENV  = Symbol.intern('%context');
const CTX_FORM = Symbol.intern('%form');

const JS_CTX_ENV = 'this.context';
const JS_CTX_FORM = 'this.form';

export function emitSymbol(s: Symbol, context: Context): string {
    if (s.equals(CTX_ENV)) {
        return JS_CTX_ENV;
    }

    if (s.equals(CTX_FORM)) {
        return JS_CTX_FORM;
    }

    if (s.hasNamespace()) {
        let ctx = context.lookup(Symbol.intern(s.namespace()));
        if (ctx == null) {
            console.error(prStr(s), context);
            throw new Error(`Unknown namespace: ${prStr(s.namespace())}`);
        }

        let ns = ctx.get(Symbol.intern(s.namespace()));
        if (isUndefined(ns.module[escapeChars(s.name())])) {
            throw new Error(`Undefined variable: ${prStr(s.name())} in namespace: ${prStr(s.namespace())}`);
        }

        return `${ns.name}.${escapeChars(s.name())}`;
    }

    let ctx = context.lookup(s);
    let s_ = escapeChars(s.name());
    if (ctx !== null) {
        return s_;
    }

    if (!isUndefined(CURRENT_NS.value.module[s_])) {
        return `${CURRENT_NS.value.name}.${s_}`;
    }

    if (!isUndefined(CORE_NS.module[s_])) {
        return `${CORE_NS.name}.${s_}`;
    }

    console.error("env", context)
    console.error(s_, CURRENT_NS.value.name, Object.keys(CURRENT_NS.value.module))
    throw new Error(`Undefined variable: ${prStr(s)}`);
}
