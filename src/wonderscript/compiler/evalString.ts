import { PushBackReader } from "../reader/PushBackReader";
import { EOF, isEOF } from "./core";
import { read } from "../reader/read";
import { emit } from "./emit";
import { Context } from "../lang/Context";
import { jsEval } from "./jsEval";

export function evalString(input: string, scope: Context, source = "inline") {
  scope.setSource(source);
  const r = new PushBackReader(input);
  let ret;
  while (true) {
    const res = read(r, { eofIsError: false, eofValue: EOF });
    scope.setLine(r.line());
    if (isEOF(res)) return ret;
    if (res != null) {
      ret = jsEval(emit(res, scope));
    }
  }
}
