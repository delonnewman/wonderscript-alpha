import {Keyword} from "./Keyword";
import {Nil} from "./Nil";
import {isFunction} from "./runtime";

export type MetaData = Map<Keyword, any>;

export interface Meta {
    meta(): MetaData | Nil;
    setMeta(key: Keyword, any): Meta;
    resetMeta(data: MetaData): Meta;
    hasMeta(): boolean;
    withMeta(data: MetaData): Meta;
}

export const isMeta = (value: any): value is Meta =>
    value != null && isFunction(value.meta) && isFunction(value.setMeta) && isFunction(value.resetMeta);
