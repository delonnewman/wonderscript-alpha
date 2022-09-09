import {escapeChars} from "../utils";
import {CURRENT_NS} from "../vars";
import {emit} from "../emit";
import {isArray} from "../../lang/runtime";
import {Env} from "../Env";
import {DEF_SYM as DEF_STR} from "../constants";
import {Form} from "../core";
import {prStr} from "../prStr";
import {isSymbol, Symbol} from "../../lang/Symbol";
import {emitQuotedMetaData} from "./emitQuote";

const DEF_SYM = Symbol.intern(DEF_STR)

export type DefForm = [typeof DEF_SYM, Symbol, Form?];

export const isDefForm = (value: any): value is DefForm =>
    isArray(value) && (value.length === 2 || value.length === 3) && DEF_SYM.equals(value[0]) && isSymbol(value[1]);

export function emitDef(form: Form, env: Env): string {
    if (!isDefForm(form)) throw new Error(`invalid ${DEF_SYM} form: ${prStr(form)}`);

    let name = escapeChars(form[1].name());
    let code = 'null';
    let val  = null;

    // set the value so it can be found in the eval below
    CURRENT_NS.value.module[name] = val;

    if (form[2] != null) {
        code = emit(form[2], env);
        // console.log("emitDef code", code);
        val  = eval(code);
    }

    let def = `${CURRENT_NS.value.name}.${name}=${code};`;
    CURRENT_NS.value.module[name] = val;

    if (form[1].hasMeta()) {
        const meta = `${CURRENT_NS.value.name}.${name}_META_=${emitQuotedMetaData(form[1].meta())};`
        def += meta;
    }

    return def;
}
