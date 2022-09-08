import {Keyword} from "../../lang/Keyword";

const KW_FUNC = 'wonderscript.core.keyword';

export function emitKeyword(kw: Keyword): string {
    if (kw.hasNamespace()) {
        return `${KW_FUNC}(${JSON.stringify(kw.namespace())},${JSON.stringify(kw.name())})`;
    }

    return `${KW_FUNC}(${JSON.stringify(kw.name())})`;
}
