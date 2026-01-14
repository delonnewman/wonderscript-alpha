export type Nil = undefined | null;

export function isNil(val: unknown): val is Nil {
  return val == null;
}
