import { Keyword } from "./Keyword";
import { Nil } from "./Nil";
import { isFunction } from "../js";

export type MetaData = Map<Keyword, any>;

export interface Meta {
  meta(): MetaData | Nil;
  hasMeta(): boolean;
  withMeta(data: MetaData): Meta;
}

export const isMeta = (value: unknown): value is Meta =>
  value != null &&
  isFunction((value as Meta).meta) &&
  isFunction((value as Meta).withMeta);
