export interface Equality<T = unknown> {
  equals(other: T): boolean;
}

export const isEquality = (value: unknown): value is Equality => {
  if (value == null) return false;

  return typeof (value as Equality).equals === "function";
};
