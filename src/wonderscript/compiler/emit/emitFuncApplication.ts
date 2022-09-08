import {findNamespaceVar} from "../findNamespaceVar";
import {emit} from "../emit";
import {Env} from "../Env";
import {isSymbol} from "../../lang/Symbol";
import {isMacro} from "../core";

export function emitFuncApplication(form, env: Env): string {
    if (isSymbol(form[0]) && isMacro(form[0]))
        throw new Error('Macros cannot be evaluated in this context');

    const fn = emit(form[0], env);
    const args = form.slice(1, form.length);
    const argBuffer = [];

    for (let i = 0; i < args.length; ++i) {
        argBuffer.push(emit(args[i], env));
    }

    if (argBuffer.length === 0) {
        return `(${fn})()`;
    }

    return `(${fn})(${argBuffer.join(', ')})`;
}
