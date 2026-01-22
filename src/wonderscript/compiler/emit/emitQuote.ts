import {
  isString,
  map,
  str,
} from "../../lang/runtime";
import {
  EMPTY_ARRAY,
  FALSE_SYM,
  NULL_SYM,
  QUOTE_SYM as QUOTE_STR,
  TRUE_SYM,
  UNDEFINED_SYM,
} from "../constants";
import { Form, isTaggedValue } from "../core";
import { prStr } from "../prStr";
import { Symbol } from "../../lang/Symbol";
import { MetaData } from "../../lang/Meta";
import { Keyword } from "../../lang/Keyword";
import { emitKeyword } from "./emitKeyword";
import { CompilerError } from "../CompilerError";
import { Context } from "../../lang/Context";

export const QUOTE_SYM = Symbol.intern(QUOTE_STR);
export type QuoteForm = [typeof QUOTE_SYM, Form];

export const isQuoteForm = (form: Form): form is QuoteForm =>
  isTaggedValue(form) && form[0].equals(QUOTE_SYM) && form.length === 2;

export function emitQuote(form: Form, scope: Context): string {
  if (!isQuoteForm(form))
    throw new CompilerError(`invalid ${QUOTE_SYM} form: ${prStr(form)}`, scope);

  return emitQuotedValue(form[1], scope);
}

export function emitQuotedMetaData(meta: MetaData): string {
  const buffer = [];
  for (let entry of meta) {
    const valStr = entry[1]?.toJS ? entry[1].toJS() : JSON.stringify(entry[1]);
    buffer.push(`[${entry[0].toJS()}, ${valStr}]`);
  }

  return `new Map([${buffer.join(", ")}])`;
}

const SYM_FUNC = "wonderscript.lang.Symbol.intern";

function emitQuotedSymbol(sym: Symbol): string {
  if (sym.hasMeta() && sym.hasNamespace()) {
    const m = emitQuotedMetaData(sym.meta());
    return `${SYM_FUNC}(${JSON.stringify(sym.name())},${JSON.stringify(sym.namespace())},${m})`;
  }

  if (sym.hasNamespace()) {
    return `${SYM_FUNC}(${JSON.stringify(sym.name())},${JSON.stringify(sym.namespace())})`;
  }

  return `${SYM_FUNC}(${JSON.stringify(sym.name())})`;
}

function emitQuotedValue(val: unknown, scope: Context): string {
  if (isString(val)) {
    return JSON.stringify(val);
  }
  if (val instanceof Symbol) {
    return emitQuotedSymbol(val);
  }
  if (val instanceof Keyword) {
    return emitKeyword(val);
  }
  if (typeof val === "number") {
    return `${val}`;
  }
  if (val === true) {
    return TRUE_SYM;
  }
  if (val === false) {
    return FALSE_SYM;
  }
  if (val === null) {
    return NULL_SYM;
  }
  if (val === undefined) {
    return UNDEFINED_SYM;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return EMPTY_ARRAY;
    return str("[", map((x) => emitQuotedValue(x, scope), val).join(", "), "]");
  }
  if (val instanceof Map) {
    const parts = map(
      (xs) =>
        str(
          "[",
          emitQuotedValue(xs[0], scope),
          ",",
          emitQuotedValue(xs[1], scope),
          "]"
        ),
      val
    );
    return str("(new Map([", parts.join(", "), "]))");
  }

  throw new CompilerError(`Invalid quoted form: ${prStr(val)}`, scope);
}
