import { Nil } from "./Nil";
import { isFunction, isString, isIterator } from "./runtime";
import { ArrayLike, isArrayLike } from "./ArrayLike";

export type First<T = unknown> = T | Nil;
export type Next<T = unknown> = Seq<T> | Nil;

type HasConsMethod = { cons: (val: unknown) => unknown[] };
export type Consable = Nil | ArrayLike | HasConsMethod;

type HasFirstMethod<T = unknown> = { first: () => T | Nil };

type HasForEachMethod<T = unknown> = {
  forEach: (cb: (val: T) => void) => void;
};

export type Nextable<T = unknown> =
  | Sequence<T>
  | ArrayLike<T>
  | HasForEachMethod<T>;

export type Seq<T = unknown, V = unknown> =
  | Readonly<T[]>
  | T[]
  | ArrayLike<T>
  | Sequence<T>
  | Map<T, V>
  | (HasFirstMethod<T> & Nextable<T>);

export interface Sequence<T = unknown> {
  cons(val: T): Sequence;
  first(): First<T>;
  next(): Next<T>;
}

export const isSequence = (value: unknown): value is Sequence =>
  isFunction((value as Sequence).cons) &&
  isFunction((value as Sequence).first) &&
  isFunction((value as Sequence).next);

export const hasFirstMethod = (col: unknown): col is HasFirstMethod =>
  isFunction((col as HasFirstMethod).first);

export const hasConsMethod = (col: unknown): col is HasConsMethod =>
  isFunction((col as HasConsMethod).cons);

export const hasForEachMethod = (col: unknown): col is HasForEachMethod =>
  isFunction((col as HasForEachMethod).forEach);

export function first<T = unknown>(col: Seq<T>): First<T> {
  if (col == null) return null;

  if (hasFirstMethod(col)) {
    return col.first();
  }

  if (isArrayLike(col)) {
    return col[0] || null;
  }

  if (isIterator(col)) {
    return col[Symbol.iterator]().next().value || null;
  }

  throw new Error("Cannot get the first element of: " + col);
}

export function next<T = unknown>(col: Nextable<T>): Seq<T> | Nil {
  if (col == null) return null;

  if (isSequence(col)) {
    return col.next();
  }

  if (isArrayLike(col)) {
    if (col.length === 0) {
      return null;
    } else {
      return Array.prototype.slice.call(col, 1);
    }
  }

  if (hasForEachMethod(col)) {
    const a = [];
    let i = 0;
    col.forEach((val: T) => {
      if (i > 0) {
        a.push(val);
      }
      i++;
    });
    return i === 0 ? null : a;
  }

  throw new Error("Cannot get the next element of: " + col);
}

export function cons(
  val: unknown,
  col: Consable
): Readonly<unknown[]> | string {
  if (col == null) return [val];

  if (hasConsMethod(col)) {
    return col.cons(val);
  }

  if (isArrayLike(col)) {
    if (isString(col)) {
      return [val, col].join("");
    } else {
      return [val].concat(col);
    }
  }

  throw new Error("Cannot cons and element to: " + col);
}
