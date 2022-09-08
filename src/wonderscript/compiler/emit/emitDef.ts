import {escapeChars} from "../utils";
import {CURRENT_NS} from "../vars";
import {emit} from "../emit";
import {isArray, str} from "../../lang/runtime";
import {Env} from "../Env";
import {DEF_SYM} from "../constants";
import {Form} from "../core";
import {prStr} from "../prStr";
import {isSymbol, Symbol} from "../../lang/Symbol";
import {emitQuotedMetaData} from "./emitQuote";

export type DefForm = [Symbol<typeof DEF_SYM>, Symbol, Form?];

const DEF = Symbol.intern(DEF_SYM)

export const isDefForm = (value: any): value is DefForm =>
    isArray(value) && (value.length === 2 || value.length === 3) && DEF.equals(value[0]) && isSymbol(value[1]);

export function emitDef(form: Form, env: Env): string {
    if (!isDefForm(form)) throw new Error(`invalid ${DEF_SYM} form: ${prStr(form)}`);

    let name = escapeChars(form[1].name());
    let code = 'null';
    let val  = null;

    // set the value so it can be found in the eval below
    CURRENT_NS.value.module[name] = val;

    if (form[2]) {
        code = emit(form[2], env);
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
