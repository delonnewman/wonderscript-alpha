import { Keyword } from "./Keyword";

export type MetaData = Map<Keyword, any>;

export interface Meta {
  meta(): MetaData | null | undefined;
  hasMeta(): boolean;
  withMeta(data: MetaData): Meta;
}

export const isMeta = (value: unknown): value is Meta =>
  value != null &&
  typeof (value as Meta).meta === "function" &&
  typeof (value as Meta).withMeta === "function";
