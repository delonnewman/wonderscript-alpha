import {Nil} from "./Nil";
import {isFunction} from "./runtime";

export type First = unknown | Nil
export type Next  = Seq | Nil

export interface Seq {
    cons(x): Seq
    first(): First
    next(): Next
}

export const isSeq = (value: any): value is Seq =>
    isFunction(value.cons) && isFunction(value.first) && isFunction(value.next)