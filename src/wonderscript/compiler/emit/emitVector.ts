import { Vector } from "../../lang/Vector";
import { emit } from "../emit";
import { Form } from "../core";
import { Context } from "../../lang/Context";

export function emitVector(form: Vector<Form>, ctx: Context): string {
  const args = Array.prototype.map
    .call(form, (x: Form) => emit(x, ctx))
    .join(", ");

  return `new wonderscript.lang.Vector([${args}])`;
}
