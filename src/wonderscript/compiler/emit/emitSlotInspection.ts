import {Form, isTaggedValue} from "../core";
import {Symbol} from "../../lang/Symbol";
import {HAS_SLOT_SYM as HAS_SLOT_STR} from "../constants";
import {prStr} from "../prStr";
import {Env} from "../Env";
import {emit} from "../emit";

export const HAS_SLOT_SYM = Symbol.intern(HAS_SLOT_STR);

export type SlotInspectionForm = [typeof HAS_SLOT_SYM, Form, Form];

export const isSlotInspectionForm = (form: Form): form is SlotInspectionForm =>
    isTaggedValue(form) && form[0].equals(HAS_SLOT_SYM) && form.length === 3;

export function emitSlotInspection(form: Form, env: Env): string {
    if (!isSlotInspectionForm(form)) throw new Error(`invalid ${HAS_SLOT_SYM} form: ${prStr(form)}`);

    const [_, obj, slot] = form;

    return `(${emit(slot, env)} in ${emit(obj, env)})`;
}