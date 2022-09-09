import {str} from "../../lang/runtime";
import {emit} from "../emit";
import {RECURSION_POINT_CLASS} from "../constants";
import {Context} from "../../lang/Context";
import {TaggedValue} from "../core";

export function emitRecursionPoint(form: TaggedValue, env: Context): string {
    const args = form.slice(1).map((x) => emit(x, env));

    return str("throw new ", RECURSION_POINT_CLASS, "([", args.join(', '), "])");
}
