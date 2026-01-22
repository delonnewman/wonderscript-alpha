import { readString, ReadForm } from "./readString";
import { emit } from "./emit";
import { Form, isTaggedValue } from "./core";
import { macroexpand } from "./macroexpand";
import { cons, map } from "../lang/runtime";
import { Context } from "../lang/Context";
import { evaluate } from "../compiler";

function evalAll(forms: ReadForm[], scope: Context): Form[] {
  const evaled = [];

  for (let i = 0; i < forms.length; i++) {
    const { form, line, column } = forms[i];
    scope.setLine(line);
    scope.setColumn(column);
    evaluate(form, scope);
    evaled.push(form);
  }

  return evaled;
}

function expandMacros(form: Form, scope: Context) {
  if (!Array.isArray(form)) {
    return form;
  } else if (isTaggedValue(form)) {
    const args = form.slice(1);
    return macroexpand(
      cons(
        form[0],
        args.map((arg) => expandMacros(arg, scope))
      ) as Form,
      scope
    );
  } else {
    return map((x) => expandMacros(x, scope), form);
  }
}

function expandAllMacros(seq: Form[], scope: Context) {
  const expanded = [];
  for (let i = 0; i < seq.length; i++) {
    const form = expandMacros(expandMacros(seq[i], scope), scope);
    expanded.push(form);
  }
  return expanded;
}

export function compileString(s: string, scope: Context): string {
  const seq = expandAllMacros(evalAll(readString(s), scope), scope);
  const buffer = [];

  for (let i = 0; i < seq.length; i++) {
    buffer.push(emit(seq[i], scope));
  }

  return buffer.join(";\n");
}
