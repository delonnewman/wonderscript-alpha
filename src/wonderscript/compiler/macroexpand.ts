import {Form, isMacro, isTaggedValue} from "./core";
import {DOT_SYM, NEW_SYM, SPECIAL_FORMS} from "./constants";
import {env, Env} from "./Env";
import {findNamespaceVar} from "./findNamespaceVar";
import {isString} from "../lang/runtime";

export function macroexpand(form: Form, scope: Env): Form {
    if (!isTaggedValue(form)) {
        return form;
    }
    else {
        var name = form[0];
        if (SPECIAL_FORMS[name]) {
            return form;
        }
        else if (name !== '.-' && name.startsWith('.-')) {
            return [DOT_SYM, form.slice(1)[0], name.slice(1)];
        }
        else if (name !== DOT_SYM && name.startsWith(DOT_SYM)) {
            return [DOT_SYM, form.slice(1)[0], [name.slice(1)].concat(form.slice(2))];
        }
        else if (name.endsWith(DOT_SYM)) {
            // @ts-ignore
            return [NEW_SYM, name.replace(/\.$/, '')].concat(form.slice(1));
        }
        else if (isString(form[0])) {
            var val = findNamespaceVar(form[0], scope);
            if (val === null) return form;
            else {
                if (isMacro(val)) {
                    const args = form.slice(1);
                    const ctx = { env: env(scope), form: form };
                    return macroexpand(val.apply(ctx, args), scope);
                }
                else {
                    return form;
                }
            }
        }
        else {
            return form;
        }
    }
}
