import { Context } from "../../lang/Context";
import { prStr } from "../prStr";
import { SLOT_SYM as SLOT_STR } from "../constants";
import { Symbol, isSymbol } from "../../lang/Symbol";
import { isKeyword, isString } from "../../lang";
import { Form, isTaggedValue } from "../core";
import { emit } from "../emit";
import { escapeChars } from "../utils";
import { QUOTE_SYM } from "./emitQuote";

export const SLOT_SYM = Symbol.intern(SLOT_STR);

export type SlotAccessForm = [typeof SLOT_SYM, Form, Form];

export const isSlotAccessForm = (form: Form): form is SlotAccessForm =>
  isTaggedValue(form) && form[0].equals(SLOT_SYM) && form.length === 3;

export function emitSlotAccess(form: Form, env: Context): string {
  if (!isSlotAccessForm(form))
    throw new Error(`invalid ${SLOT_SYM} form: ${prStr(form)}`);

  let [_, obj, slot] = form;
  if (isTaggedValue(slot) && slot[0].equals(QUOTE_SYM) && isSymbol(slot[1])) {
    slot = slot[1].name();
  }

  if (isKeyword(slot)) {
    slot = slot.name();
  }

  if (isString(slot)) {
    return `(${emit(obj, env)}).${escapeChars(slot)}`;
  }

  return `(${emit(obj, env)})[${emit(slot, env)}]`;
}
