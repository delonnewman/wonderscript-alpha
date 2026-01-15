import { isNumber } from "./predicates";

export type ArrayLike<T = unknown> = {
  length: number;
  [index: number]: T;
};

export function isArrayLike(val: unknown): val is ArrayLike {
  return val != null && isNumber((val as ArrayLike).length);
}
