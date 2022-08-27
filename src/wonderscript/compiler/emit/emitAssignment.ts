import {str} from "../../lang/runtime";
import {emit} from "./index";

export function emitAssignment(form, env) {
    if (form.length !== 3) throw new Error('set! should have 3 and only 3 elements');

    return str(emit(form[1], env), " = ", emit(form[2], env));
}
