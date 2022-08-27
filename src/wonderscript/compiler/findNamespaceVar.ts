import {Env, lookup} from "./Env";
import {escapeChars} from "./utils";
import {isUndefined} from "../lang/runtime";
import {CORE_NS, CURRENT_NS} from "./vars";

export function findNamespaceVar(s: string, env: Env) {
    if (s.indexOf('/') !== -1) {
        const parts = s.split('/');
        if (parts.length !== 2) throw new Error('A symbol should only have 2 parts');

        const scope = lookup(env, parts[0]);
        if (scope === null) return null;

        const ns  = scope.vars[parts[0]],
              val = ns.module[parts[1]];

        if (isUndefined(val)) return null;
        return val;
    }

    const s_ = escapeChars(s);
    let val = CURRENT_NS.value.module[s_];

    if (!isUndefined(val)) {
        return val;
    }

    if (!isUndefined(val = CORE_NS.module[s_])) {
        return val;
    }

    return null;
}
