import { Context } from "../lang/Context";
import { escapeChars } from "./utils";
import { CORE_NS, CURRENT_NS } from "./vars";
import { Symbol } from "../lang/Symbol";
import { MetaData } from "../lang/Meta";
import { Namespace } from "../lang";

export function findDefinitionMetaData(s: Symbol, env?: Context): MetaData {
  if (s.hasNamespace() && env) {
    const scope = env.lookup(Symbol.intern(s.namespace()));
    if (scope === null) return null;

    const ns = scope.get(Symbol.intern(s.namespace())) as Namespace | undefined;
    if (ns === undefined) return null;

    const val = ns.module[`${s.name()}_META_`];
    if (val === undefined) return null;

    return val;
  }

  const s_ = escapeChars(s.name());
  let val = CURRENT_NS.value.module[`${s_}_META_`];
  if (val !== undefined) {
    return val;
  }

  if ((val = CORE_NS.module[`${s_}_META_`]) !== undefined) {
    return val;
  }

  return null;
}
