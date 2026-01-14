import { Nil } from "./Nil";
import { isFunction } from "./runtime";

export type First<T = unknown> = T | Nil;
export type Next<T> = Sequence<T> | Nil;

export interface Sequence<T = unknown> {
  cons(val: T): Sequence;
  first(): First<T>;
  next(): Next<T>;
}

export const isSequence = (value: unknown): value is Sequence =>
  isFunction((value as Sequence).cons) &&
  isFunction((value as Sequence).first) &&
  isFunction((value as Sequence).next);
