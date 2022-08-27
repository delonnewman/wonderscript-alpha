import {emit} from "../emit";
import {str} from "../../lang/runtime";
import {Env} from "../Env";

export function emitBinOperator(form, env: Env): string {
    const op = form[0];
    const values = form.slice(1, form.length);
    const valBuffer = [];

    for (let i = 0; i < values.length; ++i) {
        valBuffer.push(emit(values[i], env));
    }

    return str('(', valBuffer.join(op), ')');
}
