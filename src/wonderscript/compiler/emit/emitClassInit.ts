import {map, str} from "../../lang/runtime";
import {emit} from "./index";
import {Env} from "../Env";

export function emitClassInit(form, env: Env): string {
    const args = map((arg) => emit(arg, env), form.slice(2)).join(', ');

    return str('new ', emit(form[1], env), '(', args, ')');
}
