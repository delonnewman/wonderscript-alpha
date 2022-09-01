import {Env} from "../Env";
import {escapeChars} from "../utils";
import {isUndefined, str} from "../../lang/runtime";
import {CORE_NS, CURRENT_NS} from "../vars";

export function emitSymbol(s: string, env: Env): string {
    if (s === '&env') {
        return 'this.env';
    }

    if (s === '&form') {
        return 'this.form';
    }

    if (s.indexOf('/') !== -1) {
        let parts = s.split('/');
        if (parts.length !== 2) throw new Error('A symbol should only have 2 parts');

        let scope = env.lookup(parts[0]);
        if (scope === null) {
            console.error(env);
            throw new Error('Unknown namespace: ' + parts[0]);
        }

        let ns = scope.vars[parts[0]];
        if (isUndefined(ns.module[escapeChars(parts[1])])) {
            throw new Error('Undefined variable: ' + parts[1] + ' in namespace: ' + parts[0]);
        }

        return str(ns.name, '.', escapeChars(parts[1]));
    }

    let s_ = escapeChars(s);
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
