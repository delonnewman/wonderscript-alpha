import { PushBackReader } from "../reader/PushBackReader";
import { EOF, isEOF } from "./core";
import { read } from "../reader/read";
import { emit } from "./emit";
import { Context } from "../lang/Context";
import { UncaughtThrowError } from "../lang/UncaughtThrowError";
import { jsEval } from "./jsEval";

export function evalString(input: string, scope: Context, source = "inline") {
  scope.setSource(source);
  scope.setLine(0);
  scope.setColumn(0);
  const r = new PushBackReader(input);
  let ret: unknown;
  while (true) {
    const res = read(r, { eofIsError: false, eofValue: EOF });
    scope.setLine(r.line);
    scope.setColumn(r.column);
    if (isEOF(res)) return ret;
    if (res != null) {
      try {
        ret = jsEval(emit(res, scope));
      } catch (e) {
        if (e instanceof UncaughtThrowError) {
          throw e;
        } else {
          throw new UncaughtThrowError(e as Error | string, scope.stacktrace().toString());
        }
      }
    }
  }
}

