import { isFunction } from "../js/core";
import { Equality, isEquality } from "./Equality";

export interface Value extends Equality {
  hashCode(): number;
}

export const isValue = (value: unknown): value is Value => {
  if (value == null) return false;

  return isFunction((value as Value).hashCode) && isEquality(value);
};
