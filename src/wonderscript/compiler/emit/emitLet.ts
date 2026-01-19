import { Context } from "../../lang/Context";
import { escapeChars } from "../utils";
import { compileBody } from "./compileBody";
import { emit } from "../emit";
import { BodyForm, Form, isBodyForm } from "../core";
import { LET_SYM as LET_STR } from "../constants";
import { prStr } from "../prStr";
import { isSymbol, Symbol } from "../../lang/Symbol";
import { CompilerError } from "../CompilerError";

export const LET_SYM = Symbol.intern(LET_STR);

export type LetForm = BodyForm<typeof LET_SYM>;

export const isLetForm = isBodyForm<typeof LET_SYM>(LET_SYM);

// TODO: move the changes from here to loop
export function emitLet(form: Form, scope: Context): string {
  if (!isLetForm(form))
    throw new CompilerError(`invalid ${LET_SYM} form: ${prStr(form)}`, scope);

  const env = new Context(scope);

  if (form.length < 2)
    throw new CompilerError(
      "A let expression should have at least 2 elements",
      scope
    );

  const buffer = ["(function(){"];
  const binds = form[1];
  const body = form.slice(2);

  // add names to function scope
  const names = [];
  for (let i = 0; i < binds.length; i += 2) {
    if (!isSymbol(binds[i]))
      throw new CompilerError("binding names should be symbols", scope);
    // TODO: should throw error for namespaced symbols
    env.define(binds[i], true);

    const bind = escapeChars(binds[i].name());
    const val = emit(binds[i + 1], env);
    names.push([bind, val, env.isMutable(binds[i])]);
  }

  const bindings = names.map(
    ([name, val, mut]) => `${mut ? "let" : "const"} ${name}=${val}`
  );
  buffer.push(`${bindings.join(";")};`);

  // body
  buffer.push(compileBody(body, env));
  buffer.push("}())");

  return buffer.join("");
}
