import { Keyword } from "../../lang/Keyword";

const KW_FUNC = "wonderscript.lang.Keyword.intern";

export function emitKeyword(kw: Keyword): string {
  if (kw.hasNamespace()) {
    return `${KW_FUNC}(${JSON.stringify(kw.name)},${JSON.stringify(kw.namespace)})`;
  }

  return `${KW_FUNC}(${JSON.stringify(kw.name)})`;
}
