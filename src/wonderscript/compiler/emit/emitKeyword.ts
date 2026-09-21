import { Keyword } from "../../lang/Keyword";
import { hasNamespace } from "../../lang/Named";

const KW_FUNC = "wonderscript.lang.Keyword.intern";

export function emitKeyword(kw: Keyword): string {
  if (hasNamespace(kw)) {
    return `${KW_FUNC}(${JSON.stringify(kw.name)},${JSON.stringify(kw.namespace)})`;
  }

  return `${KW_FUNC}(${JSON.stringify(kw.name)})`;
}
