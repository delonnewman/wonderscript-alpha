import { Keyword } from "./Keyword";
import { Nil } from "./Nil";

export type MetaData = Map<Keyword, unknown>;

export interface Meta {
  meta(): MetaData | Nil;
  hasMeta(): boolean;
  withMeta(data: MetaData): Meta;
}

export const isMeta = (value: unknown): value is Meta =>
  value != null &&
  typeof (value as Meta).meta === "function" &&
  typeof (value as Meta).withMeta === "function";
