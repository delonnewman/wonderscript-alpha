import {Form, isMacro, isSpecialForm, isTaggedValue} from "./core";
import {DOT_DASH_SYM, DOT_SYM, NEW_SYM} from "./constants";
import {Env} from "./Env";
import {findNamespaceVar} from "./findNamespaceVar";
import {isString} from "../lang/runtime";

export function macroexpand(form: Form, scope: Env): Form {
    if (!isTaggedValue(form) || isSpecialForm(form)) return form;

    const name = form[0];
    if (name !== DOT_DASH_SYM && name.startsWith(DOT_DASH_SYM)) {
        return [DOT_SYM, form.slice(1)[0], name.slice(1)];
    }

    if (name !== DOT_SYM && name.startsWith(DOT_SYM)) {
        return [DOT_SYM, form.slice(1)[0], [name.slice(1)].concat(form.slice(2))];
    }

    if (name.endsWith(DOT_SYM)) {
        // @ts-ignore
        return [NEW_SYM, name.replace(/\.$/, '')].concat(form.slice(1));
    }

    if (isString(form[0])) {
        const val = findNamespaceVar(form[0], scope);
        if (val === null) return form;

        if (isMacro(val)) {
            const args = form.slice(1);
            const ctx = {env: new Env(scope), form: form};

            return macroexpand(val.apply(ctx, args), scope);
        }
    }

    return form;
}
