import {Env} from "../Env";
import {escapeChars} from "../utils";
import {isUndefined, str} from "../../lang/runtime";
import {CORE_NS, CURRENT_NS} from "../vars";
import {Symbol} from "../../lang/Symbol";
import {prStr} from "../prStr";

const CTX_ENV  = Symbol.intern('&env');
const CTX_FORM = Symbol.intern('&form');

const JS_CTX_ENV = 'this.env';
const JS_CTX_FORM = 'this.form';

export function emitSymbol(s: Symbol, env: Env): string {
    if (s.equals(CTX_ENV)) {
        return JS_CTX_ENV;
    }

    if (s.equals(CTX_FORM)) {
        return JS_CTX_FORM;
    }

    if (s.hasNamespace()) {
        let scope = env.lookup(s.namespace());
        if (scope === null) {
            console.error(env);
            throw new Error(`Unknown namespace: ${prStr(s.namespace())}`);
        }

        let ns = scope.vars[s.namespace()];
        if (isUndefined(ns.module[escapeChars(s.name())])) {
            throw new Error(`Undefined variable: ${prStr(s.name())} in namespace: ${prStr(s.namespace())}`);
        }

        return `${ns.name}.${escapeChars(s.name())}`;
    }

    let s_ = escapeChars(s.name());
    let scope = env.lookup(s_);
    if (scope !== null) {
        return s_;
    }

    if (!isUndefined(CURRENT_NS.value.module[s_])) {
        return str(CURRENT_NS.value.name, '.', s_);
    }

    if (!isUndefined(CORE_NS.module[s_])) {
        return str(CORE_NS.name, '.', s_);
    }

    console.error("env", env)
    console.error(s_, CURRENT_NS.value.name, Object.keys(CURRENT_NS.value.module))
    throw new Error(str('Undefined variable: "', s, '"'));
}
