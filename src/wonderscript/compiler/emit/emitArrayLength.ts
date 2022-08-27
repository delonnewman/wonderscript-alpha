import {str} from "../../lang/runtime";
import {emit} from "../emit";

export function emitArrayLength(form, env) {
    if (form.length !== 2)
        throw new Error(str('Wrong number of arguments expected 1, got ', form.length));

    return str(emit(form[1], env), '.length');
}

