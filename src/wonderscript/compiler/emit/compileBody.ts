import { emitTailPosition } from "./emitTailPosition";
import { map, str } from "../../lang/runtime";
import { Form } from "../core";
import { emit } from "../emit";
import { RECURSION_POINT_CLASS } from "../constants";
import { Context } from "../../lang/Context";
import { Symbol } from "../../lang";

export function compileBody(body: Form[], env: Context, tailDef?: string) {
  const last = body[body.length - 1];
  const head = body.slice(0, body.length - 1);

  return map<Form>((x) => emit(x, env), head)
    .concat(emitTailPosition(last, env, tailDef))
    .join("; ");
}

export function compileRecursiveBody(
  body: Form[],
  names: Symbol[] | Readonly<Symbol[]>,
  env: Context
): string {
  const buff = [];
  for (let i = 0; i < names.length; i++) {
    buff.push(str(names[i], " = e.args[", i, "]"));
  }
  const rebinds = buff.join("; ");

  env.setRecursive();

  return str(
    "var retval;\nloop:\n\twhile (true) { try { ",
    compileBody(body, env, "retval ="),
    "; break loop; } catch (e) { if (e instanceof ",
    RECURSION_POINT_CLASS,
    ") { ",
    rebinds,
    "; continue loop; } else { throw e; } } }\nreturn retval"
  );
}
