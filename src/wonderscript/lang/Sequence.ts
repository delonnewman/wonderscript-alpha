import { Nil } from "./Nil";
import { isFunction } from "./runtime";
import { ArrayLike } from "./ArrayLike";

export type First<T = unknown> = T | Nil;
export type Next<T = unknown> = Seq<T> | Nil;

type ConsMethod = { cons: (val: unknown) => unknown[] };
export type Consable = ArrayLike | Nil | ConsMethod;

type HasFirstMethod<T = unknown> = { first: () => T | Nil };

type Firstable<T = unknown, U = unknown> =
  | HasFirstMethod<T>
  | ArrayLike<T>
  | Map<T, U>
  | Set<T>;

type HasForEachMethod<T = unknown> = {
  forEach: (cb: (val: T) => void) => void;
};

type Nextable<T = unknown> = Sequence<T> | ArrayLike<T> | HasForEachMethod<T>;

export type Seq<T = unknown> =
  | Readonly<T[]>
  | Sequence<T>
  | (Firstable<T> & Nextable<T>);

export interface Sequence<T = unknown> {
  cons(val: T): Sequence;
  first(): First<T>;
  next(): Next<T>;
}

export const isSequence = (value: unknown): value is Sequence =>
  isFunction((value as Sequence).cons) &&
  isFunction((value as Sequence).first) &&
  isFunction((value as Sequence).next);
