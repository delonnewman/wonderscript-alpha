import { Context } from "../../lang/Context";
import { Form, isMacro } from "../core";
import { prStr } from "../prStr";
import { Symbol } from "../../lang/Symbol";
import {
  Message,
} from "../../lang";
import { CompilerError } from "../CompilerError";

export function emitInternedSend(form: Form[], ctx: Context): string {
  if (form[0] instanceof Symbol && isMacro(form[0])) {
    throw new CompilerError(
      `macros cannot be evaluated in this context: ${prStr(form)}`,
      ctx
    );
  }

  const msg = form.slice(1, form.length);
  if (msg.length == 0) {
    // error
    throw new Error(`malformed message dispatch ${prStr(form)}`)
  }

  let m: Message;
  if (msg.length == 1 && msg[0] instanceof Symbol) {
    m = Message.simple(msg[0]);
  } else {
    m = Message.compound(msg)
  }

  return m.toJS(ctx, form[0]);
}
