import {str} from "../../lang/runtime";
import {emit} from "./index";
import {RECURSION_POINT_CLASS} from "../constants";
import {Env} from "../Env";

export function emitRecursionPoint(form, env: Env): string {
    return str("throw new ", RECURSION_POINT_CLASS, "([",
        form.slice(1).map(function(x) { return emit(x, env); }).join(', '), "])");
}
