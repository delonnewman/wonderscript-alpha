import { emit } from "../emit";
import { SSET_SYM as SSET_STR } from "../constants";
import { Form, isTaggedValue } from "../core";
import { prStr } from "../prStr";
import { Symbol } from "../../lang/Symbol";
import { Context } from "../../lang/Context";
import { emitSlotName } from "./slots";
import { CompilerError } from "../CompilerError";

export const SSET_SYM = Symbol.intern(SSET_STR);

export type SlotMutationForm = [typeof SSET_SYM, any[], Form, Form];

export const isSlotMutationForm = (form: Form): form is SlotMutationForm =>
  isTaggedValue(form) && form[0].equals(SSET_SYM) && form.length === 4;

export function emitSlotMutation(form: Form, ctx: Context): string {
  if (!isSlotMutationForm(form))
    throw new CompilerError(`invalid ${SSET_SYM} form: ${prStr(form)}`);

  const [_tag, obj, slot, value] = form;
  const slotName = emitSlotName(slot);

  if (slotName) {
    return `(${emit(obj, ctx)}).${slotName}=${emit(value, ctx)}`;
  }

  return `${emit(obj, ctx)}[${emit(slot, ctx)}]=${emit(value, ctx)}`;
}
