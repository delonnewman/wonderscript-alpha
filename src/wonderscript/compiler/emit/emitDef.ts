import {escapeChars} from "../utils";
import {CURRENT_NS} from "../vars";
import {emit} from "../emit";
import {isArray, isString, str} from "../../lang/runtime";
import {Env} from "../Env";
import {DEF_SYM} from "../constants";
import {Form} from "../core";
import {prStr} from "../prStr";

export type DefForm = [typeof DEF_SYM, string, Form?];

export const isDefForm = (value: any): value is DefForm =>
    isArray(value) && (value.length === 2 || value.length === 3) && value[0] === DEF_SYM && isString(value[1]);

export function emitDef(form: Form, env: Env): string {
    if (!isDefForm(form)) throw new Error(`invalid ${DEF_SYM} form: ${prStr(form)}`);

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
