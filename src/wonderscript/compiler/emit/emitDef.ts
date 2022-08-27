import {escapeChars} from "../utils";
import {CURRENT_NS} from "../vars";
import {emit} from "./index";
import {str} from "../../lang/runtime";
import {Env} from "../Env";

export function emitDef(form, env: Env): string {
    let name = escapeChars(form[1]);
    let code = 'null';
    let val  = null;

    // set the value so it can be found in the eval below
    CURRENT_NS.value.module[name] = val;

    if (form[2]) {
        code = emit(form[2], env);
        val  = eval(code);
    }

    const def = str(CURRENT_NS.value.name, ".", name, " = ", code, ";");
    CURRENT_NS.value.module[name] = val;
    return def;
}
