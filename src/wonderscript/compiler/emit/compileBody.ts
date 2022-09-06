import {emitTailPosition} from "./emitTailPosition";
import {map, str} from "../../lang/runtime";
import {emit} from "../emit";
import {RECURSION_POINT_CLASS} from "../constants";
import {Env} from "../Env";

export function compileBody(body, env: Env, tailDef?: string) {
    const last = body[body.length - 1];
    const head = body.slice(0, body.length - 1);

    return map((x) => emit(x, env), head)
        .concat(emitTailPosition(last, env, tailDef)).join('; ');
}

export function compileRecursiveBody(body, names, env: Env): string {
    const buff = [];
    for (let i = 0; i < names.length; i++) {
        buff.push(str(names[i], ' = e.args[', i, ']'));
    }
    const rebinds = buff.join('; ');

    env.setRecursive();

    return str(
        "var retval;\nloop:\n\twhile (true) { try { ",
        compileBody(body, env, 'retval ='),
        "; break loop; } catch (e) { if (e instanceof ", RECURSION_POINT_CLASS,
        ") { ", rebinds, "; continue loop; } else { throw e; } } };\nreturn retval"
    );
}
