import {Form, isMacro, isSpecialForm, isTaggedValue} from "./core";
import {DOT_DASH_SYM as DOT_DASH_STR, DOT_SYM as DOT_STR, NEW_SYM as NEW_STR} from "./constants";
import {Context} from "../lang/Context";
import {findNamespaceVar} from "./findNamespaceVar";
import {isSymbol, Symbol} from "../lang/Symbol";

const DOT_DASH_SYM = Symbol.intern(DOT_DASH_STR)
const DOT_SYM      = Symbol.intern(DOT_STR)
const NEW_SYM      = Symbol.intern(NEW_STR)

export function macroexpand(form: Form, scope: Context): Form {
    if (!isTaggedValue(form) || isSpecialForm(form)) return form;

    const sym = form[0];

    // TODO: move this to reader
    const name = sym.name();
    if (!sym.equals(DOT_DASH_SYM) && name.startsWith(DOT_DASH_STR)) {
        return [DOT_SYM, form.slice(1)[0], Symbol.intern(name.slice(1))];
    }

    if (!sym.equals(DOT_SYM) && name.startsWith(DOT_STR)) {
        return [DOT_SYM, form.slice(1)[0], [Symbol.intern(name.slice(1))].concat(form.slice(2))];
    }

    if (name.endsWith(DOT_STR)) {
        // @ts-ignore
        return [NEW_SYM, Symbol.intern(name.slice(0, name.length - 1), sym.namespace())].concat(form.slice(1));
    }

    if (isSymbol(form[0])) {
        const val = findNamespaceVar(form[0], scope);
        if (val == null) return form;

        if (isMacro(form[0])) {
            const args = form.slice(1);
            const ctx = {context: new Context(scope), form: form};

            return macroexpand(val.apply(ctx, args), scope);
        }
    }

    return form;
}
