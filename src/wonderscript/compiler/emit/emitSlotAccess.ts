import {Env} from "../Env";
import {prStr} from "../prStr";
import {SLOT_SYM as SLOT_STR} from "../constants";
import {Symbol} from "../../lang/Symbol";
import {Form, isTaggedValue} from "../core";
import {emit} from "../emit";

export const SLOT_SYM = Symbol.intern(SLOT_STR);

export type SlotAccessForm = [typeof SLOT_SYM, Form, Form];

export const isSlotAccessForm = (form: Form): form is SlotAccessForm =>
    isTaggedValue(form) && form[0].equals(SLOT_SYM) && form.length === 3;

export function emitSlotAccess(form, env: Env): string {
    if (!isSlotAccessForm(form)) throw new Error(`invalid ${SLOT_SYM} form: ${prStr(form)}`);

    const [_, obj, slot] = form;

    return `(${emit(obj, env)})[${emit(slot, env)}]`;
}
