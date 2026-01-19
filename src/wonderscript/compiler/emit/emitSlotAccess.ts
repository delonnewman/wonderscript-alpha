import { Context } from "../../lang/Context";
import { prStr } from "../prStr";
import { SLOT_SYM as SLOT_STR } from "../constants";
import { Symbol } from "../../lang/Symbol";
import { Form, isTaggedValue } from "../core";
import { emit } from "../emit";
import { emitSlotName } from "./slots";
import { CompilerError } from "../CompilerError";

export const SLOT_SYM = Symbol.intern(SLOT_STR);

export type SlotAccessForm = [typeof SLOT_SYM, Form, Form];

export const isSlotAccessForm = (form: Form): form is SlotAccessForm =>
  isTaggedValue(form) && form[0].equals(SLOT_SYM) && form.length === 3;

export function emitSlotAccess(form: Form, env: Context): string {
  if (!isSlotAccessForm(form))
    throw new CompilerError(`invalid ${SLOT_SYM} form: ${prStr(form)}`);

  let [_, obj, slot] = form;
  const slotName = emitSlotName(slot);

  if (slotName) {
    return `(${emit(obj, env)}).${slotName}`;
  }

  return `(${emit(obj, env)})[${emit(slot, env)}]`;
}
