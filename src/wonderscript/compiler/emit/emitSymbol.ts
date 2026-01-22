import { Context } from "../../lang/Context";
import { escapeChars } from "../utils";
import { isUndefined } from "../../lang/runtime";
import { CORE_NS, CURRENT_NS } from "../vars";
import { Symbol } from "../../lang/Symbol";
import { prStr } from "../prStr";
import { Namespace } from "../../lang";
import { CompilerError } from "../CompilerError";

export const CTX_SYM = Symbol.intern("*ctx*");
export const FORM_SYM = Symbol.intern("*form*");

const JS_CTX_ENV = "this.context";
const JS_CTX_FORM = "this.form";

export function emitSymbol(s: Symbol, context: Context): string {
  if (s.equals(CTX_SYM)) {
    return JS_CTX_ENV;
  }

  if (s.equals(FORM_SYM)) {
    return JS_CTX_FORM;
  }

  if (s.hasNamespace()) {
    let ctx = context.lookup(Symbol.intern(s.namespace()));
    if (ctx == null) {
      console.error(prStr(s), context);
      throw new CompilerError(
        `Unknown namespace: ${prStr(s.namespace())}`,
        ctx
      );
    }

    let ns = ctx.get(Symbol.intern(s.namespace())) as Namespace | undefined;
    if (ns === undefined || ns.module[escapeChars(s.name())] === undefined) {
      throw new CompilerError(
        `Undefined variable: ${prStr(s.name())} in namespace: ${prStr(s.namespace())}`,
        ctx
      );
    }

    return `${ns.name}.${escapeChars(s.name())}`;
  }

  let ctx = context.lookup(s);
  let s_ = escapeChars(s.name());
  if (ctx !== null) {
    return s_;
  }

  if (!isUndefined(CURRENT_NS.value.module[s_])) {
    return `${CURRENT_NS.value.name}.${s_}`;
  }

  if (!isUndefined(CORE_NS.module[s_])) {
    return `${CORE_NS.name}.${s_}`;
  }

  console.error("env", context);

  throw new CompilerError(`Undefined variable: ${prStr(s)}`, context);
}
