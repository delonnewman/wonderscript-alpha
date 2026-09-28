import { Equality, isEquality } from "./Equality";

export interface Hashable {
  hashCode(): number;
}

export interface Value extends Equality, Hashable {
}

export const isHashable = (value: unknown): value is Hashable => {
  if (value == null) return false;

  return typeof (value as Hashable).hashCode === 'function';
}

export const isValue = (value: unknown): value is Value => {
  if (value == null) return false;

  return isHashable(value) && isEquality(value);
};
