import {str} from "../../lang/runtime";
import {emit} from "../emit";

export function emitArrayAccess(form, env) {
    if (form.length !== 3)
        throw new Error(str('Wrong number of arguments expected 2, got ', form.length - 1));

    return str(emit(form[1], env), '[', emit(form[2], env), ']');
}
