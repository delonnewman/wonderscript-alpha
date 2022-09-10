import {Context} from "../lang/Context";
import {escapeChars} from "./utils";
import {isUndefined} from "../lang/runtime";
import {CORE_NS, CURRENT_NS} from "./vars";
import {Symbol} from "../lang/Symbol";

export function findNamespaceVar(s: Symbol, env?: Context) {
    if (s.hasNamespace() && env) {
        const scope = env.lookup(Symbol.intern(s.namespace()));
        if (scope === null) return null;

        const ns  = scope.get(Symbol.intern(s.namespace()));
        const val = ns.module[s.name()];

        if (isUndefined(val)) return null;

        return val;
    }

    const s_ = escapeChars(s.name());
    let val = CURRENT_NS.value.module[s_];

    if (!isUndefined(val)) {
        return val;
    }

    if (!isUndefined(val = CORE_NS.module[s_])) {
        return val;
    }

    return null;
}
