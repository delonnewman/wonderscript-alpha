import { Form, isMacro, isSpecialForm, isTaggedValue } from "./core";
import { Context } from "../lang/Context";
import { findNamespaceVar } from "./findNamespaceVar";
import { Symbol } from "../lang/Symbol";
import { prStr } from "../compiler";

export function macroexpand(form: Form, scope: Context): Form {
  if (!isTaggedValue(form) || isSpecialForm(form)) return form;

  const sym = form[0];
  if (sym instanceof Symbol) {
    const val = findNamespaceVar(form[0], scope);
    if (val == null) return form;

    if (isMacro(sym)) {
      const args = form.slice(1);
      const ctx = { context: new Context(scope), form };

      return macroexpand(val.apply(ctx, args), scope);
    }
  }

  return form;
}
