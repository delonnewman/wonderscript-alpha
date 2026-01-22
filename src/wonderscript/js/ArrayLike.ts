export type ArrayLike<T = unknown> = {
  length: number;
  [index: number]: T;
};

export function isArrayLike(val: unknown): val is ArrayLike {
  return val != null && typeof (val as ArrayLike).length === "number";
}
