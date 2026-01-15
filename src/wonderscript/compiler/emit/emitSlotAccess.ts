import { Context } from "../../lang/Context";
import { prStr } from "../prStr";
import { SLOT_SYM as SLOT_STR } from "../constants";
import { Symbol, isSymbol } from "../../lang/Symbol";
import { Form, isTaggedValue } from "../core";
import { emit } from "../emit";
import { escapeChars } from "../utils";

export const SLOT_SYM = Symbol.intern(SLOT_STR);

export type SlotAccessForm = [typeof SLOT_SYM, Form, Form];

export const isSlotAccessForm = (form: Form): form is SlotAccessForm =>
  isTaggedValue(form) && form[0].equals(SLOT_SYM) && form.length === 3;

export function emitSlotAccess(form: Form, env: Context): string {
  if (!isSlotAccessForm(form))
    throw new Error(`invalid ${SLOT_SYM} form: ${prStr(form)}`);

  const [_, obj, slot] = form;

  if (isSymbol(slot)) {
    const name = slot.name();
    return `(${emit(obj, env)}).${escapeChars(name)}`;
  }

  return `(${emit(obj, env)})[${emit(slot, env)}]`;
}
