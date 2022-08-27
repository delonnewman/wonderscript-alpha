import {str} from "../../lang/runtime";
import {emit} from "./index";

export function emitArrayMutation(form, env) {
    if (form.length !== 4)
        throw new Error(str('Wrong number of arguments expected 3, got ', form.length));

    return str(emit(form[1], env), '[', emit(form[2], env), ']=', emit(form[3], env));
}

