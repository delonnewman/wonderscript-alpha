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
  isTaggedValue(form) && form[0].equals(SLOT_SYM);

export function emitSlotAccess(form: Form, env: Context): string {
  if (!isSlotAccessForm(form))
    throw new CompilerError(`invalid ${SLOT_SYM} form: ${prStr(form)}`, env);

  let [_, obj, ...slots] = form;

  const slotName = slots
    .map((slot) => {
      const name = emitSlotName(slot);
      return name !== undefined ? `.${name}` : `[${emit(slot, env)}]`;
    })
    .join("");

  return `(${emit(obj, env)})${slotName}`;
}
