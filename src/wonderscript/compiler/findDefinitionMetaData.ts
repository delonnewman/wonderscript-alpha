import {Context} from "../lang/Context";
import {escapeChars} from "./utils";
import {isUndefined} from "../lang/runtime";
import {CORE_NS, CURRENT_NS} from "./vars";
import {Symbol} from "../lang/Symbol";
import {MetaData} from "../lang/Meta";

export function findDefinitionMetaData(s: Symbol, env?: Context): MetaData {
    if (s.hasNamespace() && env) {
        const scope = env.lookup(s.namespace());
        if (scope === null) return null;

        const ns  = scope.get(s.namespace());
        const val = ns.module[`${s.name()}_META_`];

        if (isUndefined(val)) return null;

        return val;
    }

    const s_ = escapeChars(s.name());
    let val = CURRENT_NS.value.module[`${s_}_META_`];

    if (!isUndefined(val)) {
        return val;
    }

    if (!isUndefined(val = CORE_NS.module[`${s_}_META_`])) {
        return val;
    }

    return null;
}
