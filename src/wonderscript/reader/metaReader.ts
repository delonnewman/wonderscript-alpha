import { _read } from "./read";
import { Symbol } from "../lang/Symbol";
import { TAG_KEY } from "./core";
import { Keyword } from "../lang/Keyword";
import { isMeta } from "../lang/Meta";
import { PushBackReader } from "./PushBackReader";

export function metaReader(
  r: PushBackReader,
  _hat: string,
  opts: Record<string, unknown>
) {
  let meta = _read(r, true, null, true, opts);
  if (meta instanceof Symbol) {
    meta = new Map([[TAG_KEY, meta]]);
  } else if (meta instanceof Keyword) {
    meta = new Map([[meta, true]]);
  } else if (!(meta instanceof Map)) {
    throw new Error("Metadata must be a Symbol, Keyword, String or Map");
  }

  let value = _read(r, true, null, true, opts);
  if (isMeta(value)) {
    value = value.withMeta(meta);
  }

  return value;
}
