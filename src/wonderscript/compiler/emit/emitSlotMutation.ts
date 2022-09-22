import {emit} from "../emit";
import {SSET_SYM as SSET_STR} from "../constants";
import {Form, isTaggedValue} from "../core";
import {prStr} from "../prStr";
import {isSymbol, Symbol} from "../../lang/Symbol";
import {Context} from "../../lang/Context";

export const SSET_SYM = Symbol.intern(SSET_STR);

export type SlotMutationForm = [typeof SSET_SYM, any[], Form, Form];

export const isSlotMutationForm = (form: Form): form is SlotMutationForm =>
    isTaggedValue(form) && form[0].equals(SSET_SYM) && form.length === 4;

export function emitSlotMutation(form: Form, ctx: Context): string {
    if (!isSlotMutationForm(form)) throw new Error(`invalid ${SSET_SYM} form: ${prStr(form)}`);

    const [_tag, obj, prop, value] = form;

    if (isSymbol(prop)) {
        // TODO: what should we do with namespaced symbols
        return `${emit(obj, ctx)}.${prop.name()}=${emit(value, ctx)}`;
    }

    return `${emit(obj, ctx)}[${emit(prop, ctx)}]=${emit(value, ctx)}`;
}

