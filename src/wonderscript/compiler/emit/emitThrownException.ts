import {str} from "../../lang/runtime";
import {emit} from "./index";

export function emitThrownException(form, env) {
    if (form.length !== 2)
        throw new Error(str('Wrong number of arguments should have 2, got', form.length));
    return str("throw ", emit(form[1], env));
}
