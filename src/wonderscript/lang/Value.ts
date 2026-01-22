import { Equality, isEquality } from "./Equality";

export interface Value extends Equality {
  hashCode(): number;
}

export const isValue = (value: unknown): value is Value => {
  if (value == null) return false;

  return typeof (value as Value).hashCode === "function" && isEquality(value);
};
