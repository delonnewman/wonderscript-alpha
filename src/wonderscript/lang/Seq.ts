import {Nil} from "./Nil";

export type First = unknown | Nil
export type Next  = Seq | Nil

export interface Seq {
    first(): First
    next(): Next
}