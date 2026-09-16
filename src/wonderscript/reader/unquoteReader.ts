import { PushBackReader } from "./PushBackReader";
import { _read } from "./read";
import { Symbol } from "../lang/Symbol";

export const UNQUOTE_SYM = Symbol.intern("unquote");
export const UNQUOTE_SPLICING_SYM = Symbol.intern("unquote-splicing");

export function unquoteReader(
  r: PushBackReader,
  _: unknown,
  opts: Record<string, unknown>
): unknown {
  const ch = r.read();
  if (ch === null) {
    throw new Error("Unexpected end of input while reading unquote.");
  }
  if (ch === "@") {
    const value = _read(r, true, null, true, opts);
    return [UNQUOTE_SPLICING_SYM, value];
  } else {
    r.unread(ch);
    const value = _read(r, true, null, true, opts);
    return [UNQUOTE_SYM, value];
  }
}
