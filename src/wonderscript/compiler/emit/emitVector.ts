import {Vector} from "../../lang/Vector";
import {emit} from "../emit";
import {Context} from "../../lang/Context";

export function emitVector(form: Vector, ctx: Context): string {
    const args = Array.prototype.map.call(form, (x) => emit(x, ctx)).join(', ');

    return `wonderscript.core.vector(${args})`
}