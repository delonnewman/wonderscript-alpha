import {isArray} from "../lang/runtime";
import {RECUR_SYM as RECUR_STR, SPECIAL_FORMS, THROW_SYM as THROW_STR} from "./constants";
import {isSymbol, Symbol} from "../lang/Symbol"
import {Keyword} from "../lang/Keyword";
import {findDefinitionMetaData} from "./findDefinitionMetaData";

export function isMacro(sym: Symbol): boolean {
    const meta = findDefinitionMetaData(sym)
    if (meta == null) return false;

    return meta.get(Keyword.intern("macro")) === true
}

export type TaggedValue<Tag = Symbol> = [Tag, ...any]
export type Form = string | number | null | undefined | Map<any, any> | Set<any> | TaggedValue | any[] | Symbol | Keyword

export type BodyForm<Tag> = [Tag, Symbol[], ...Form[]];

export function isBodyForm<Tag>(tag: Symbol) {
    return (form: Form): form is BodyForm<Tag> => isTaggedValue(form) && tag.equals(form[0]) && isArray(form[1]);
}

export function isTaggedValue<Tag = Symbol>(x): x is TaggedValue<Tag> {
    return isArray(x) && isSymbol(x[0]);
}

const RECUR_SYM = Symbol.intern(RECUR_STR)

export function isRecur(x): x is TaggedValue<typeof RECUR_SYM> {
    return isTaggedValue(x) && x[0].equals(RECUR_SYM)
}

const THROW_SYM = Symbol.intern(THROW_STR)

export function isThrow(x): x is TaggedValue<typeof THROW_SYM> {
    return isTaggedValue(x) && x[0].equals(THROW_SYM)
}

export const EOF = { eof: true } as const;
export type EOF = typeof EOF;

export function isEOF(x): x is EOF {
    return x && x.eof === true;
}

export type SpecialFormSymbol = keyof typeof SPECIAL_FORMS;
export type SpecialForm = TaggedValue<SpecialFormSymbol>;

export const isSpecialForm = (value: any): value is SpecialForm =>
    isTaggedValue(value) && SPECIAL_FORMS[value[0].name()] === true;