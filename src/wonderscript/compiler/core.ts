import {isArray} from "../lang/runtime";
import {RECUR_SYM as RECUR_STR, SPECIAL_FORMS, THROW_SYM as THROW_STR} from "./constants";
import {isSymbol, Symbol} from "../lang/Symbol"
import {Keyword} from "../lang/Keyword";
import {findDefinitionMetaData} from "./findDefinitionMetaData";
import {FN_SYM} from "./emit/emitFunc";
import {LET_SYM} from "./emit/emitLet";
import {LOOP_SYM} from "./emit/emitLoop";
import {List} from "../lang/List";
import {Vector} from "../lang/Vector";
import {isSlotMutationForm, SlotMutationForm} from "./emit/emitSlotMutation";
import {ArrayMutationForm, isArrayMutationForm} from "./emit/emitArrayMutation";
import {isJSForm} from "./emit/emitJS";

export function isMacro(sym: Symbol): boolean {
    const meta = findDefinitionMetaData(sym)
    if (meta == null) return false;

    return meta.get(Keyword.intern("macro")) === true
}

export type TaggedValue<Tag = Symbol> = [Tag, ...any]
export type Form =
    | number
    | boolean
    | string
    | null
    | undefined
    | Symbol
    | Keyword
    | Map<Form, Form>
    | Set<Form>
    | List
    | Vector
    | Array<Form>
    | TaggedValue

export type BodyTag =
    | typeof FN_SYM
    | typeof LET_SYM
    | typeof LOOP_SYM

export type BodyForm<Tag extends BodyTag> = [Tag, Symbol[], ...Form[]];

export function isBodyForm<Tag extends BodyTag>(tag: Symbol) {
    return (form: Form): form is BodyForm<Tag> => isTaggedValue<BodyTag>(form, tag) && isArray(form[1]);
}

export function isTaggedValue<Tag = Symbol>(form, tag?: Symbol): form is TaggedValue<Tag> {
    const tagged = isArray(form) && isSymbol(form[0])
    if (tag == null) return tagged;

    return tagged && tag.equals(form[0]);
}

export const RECUR_SYM = Symbol.intern<typeof RECUR_STR>(RECUR_STR)

export function isRecurForm(x): x is TaggedValue<typeof RECUR_SYM> {
    return isTaggedValue<typeof RECUR_SYM>(x, RECUR_SYM);
}

export const THROW_SYM = Symbol.intern<typeof THROW_STR>(THROW_STR)

export function isThrowForm(x): x is TaggedValue {
    return isTaggedValue(x) && x[0].equals(THROW_SYM)
}

// forms that compile to JS statements
export type StatementForm = SlotMutationForm | ArrayMutationForm

export function isStatementForm(form: Form): form is StatementForm {
    return isSlotMutationForm(form) || isArrayMutationForm(form) || isJSForm(form)
}

export const EOF = { eof: true } as const;
export type EOF = typeof EOF;

export function isEOF(x): x is EOF {
    return x && x.eof === true;
}

export type SpecialFormSymbol = keyof typeof SPECIAL_FORMS;
export type SpecialForm = TaggedValue<Symbol<SpecialFormSymbol>>;

export const isSpecialForm = (value: any): value is SpecialForm =>
    isTaggedValue(value) && SPECIAL_FORMS[value[0].name()] === true;