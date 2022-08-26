import {Keyword} from "./Keyword";
import {Nil} from "./Nil";

export type MetaMap = Map<Keyword, any>;

export interface Meta {
    meta(): Map<Keyword, any> | Nil;
}