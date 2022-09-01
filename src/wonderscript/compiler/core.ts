import {getMeta, isArray, isFunction, isString, str} from "../lang/runtime";
import {KEYWORD_SYM, RECUR_SYM, SPECIAL_FORMS, THROW_SYM} from "./constants";

export function isMacro(x): boolean {
    return isFunction(x) && getMeta(x, "macro") === true;
}

export type TaggedValue<Tag = string> = [Tag, ...any]
export type Form = string | number | null | undefined | Map<any, any> | Set<any> | TaggedValue | any[]

export function isTaggedValue<Tag = string>(x): x is TaggedValue<Tag> {
    return isArray(x) && isString(x[0]);
}

export function isKeyword(x): x is TaggedValue<typeof KEYWORD_SYM> {
    return isArray(x) && x[0] === KEYWORD_SYM;
}

export const isSymbol = isString

export function isRecur(x): x is TaggedValue<typeof RECUR_SYM> {
    return isArray(x) && x[0] === RECUR_SYM;
}

export function isThrow(x): x is TaggedValue<typeof THROW_SYM> {
    return isArray(x) && x[0] === THROW_SYM;
}

export const EOF = { eof: true } as const;
export type EOF = typeof EOF;

export function isEOF(x): x is EOF {
    return x && x.eof === true;
}

export type SpecialFormSymbol = keyof typeof SPECIAL_FORMS;
export type SpecialForm = TaggedValue<SpecialFormSymbol>;

export const isSpecialForm = (value: any): value is SpecialForm =>
    isTaggedValue(value) && SPECIAL_FORMS[value[0]] === true;