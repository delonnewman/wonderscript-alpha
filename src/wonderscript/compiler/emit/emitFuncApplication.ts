import {isString, str} from "../../lang/runtime";
import {isMacro} from "../core";
import {findNamespaceVar} from "../findNamespaceVar";
import {emit} from "../emit";
import {Env} from "../Env";

export function emitFuncApplication(form, env: Env): string {
    if (isString(form[0]) && isMacro(findNamespaceVar(form[0])))
        throw new Error('Macros cannot be evaluated in this context');

    var fn = emit(form[0], env),
        args = form.slice(1, form.length),
        argBuffer = [], i, value;

    for (i = 0; i < args.length; ++i) {
        value = emit(args[i], env);
        argBuffer.push(value);
    }

    if (argBuffer.length === 0) {
        return str('(', fn, ')()');
    }

    return str('(', fn, ')(', argBuffer.join(', ') ,")");
}
