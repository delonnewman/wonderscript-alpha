import {Nil} from "./Nil";
import {isFunction} from "./runtime";

export type First = unknown | Nil
export type Next  = Sequence | Nil

export interface Sequence {
    cons(x): Sequence
    first(): First
    next(): Next
}

export const isSequence = (value: any): value is Sequence =>
    isFunction(value.cons) && isFunction(value.first) && isFunction(value.next)