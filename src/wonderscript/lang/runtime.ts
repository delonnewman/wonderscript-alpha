import { Seq, first, next } from "./Seq";
import { isArrayLike } from "../js";
import { isMeta, Meta } from "./Meta";
import { Keyword } from "./Keyword";
import { Symbol as WSSymbol } from "./Symbol";
import { List } from "./List";
import { Vector } from "./Vector";

export { hashCode } from "./utils";
export { cons, first, next, isSequence } from "./Seq";
export { merge } from "./merge";
export { str } from "./str";
export {
  isString,
  isObject,
  isUndefined,
  isNull,
  isNumber,
  isInteger,
  isSet,
  isMap,
  isFunction,
  isIterator,
} from "../js";

const EMPTY_ARRAY: Readonly<unknown[]> = Object.freeze([]);

export type Indexed<T = unknown> = Array<T> | ArrayLike<T> | Vector<T>;

type Mapper<In, Out> = (x: In) => Out;
type Reducing<Memo, Item> = (a: Memo, b: Item) => Memo;

export function rest<T = unknown>(col: Seq<T>): Seq<T> {
  const val = next(col);

  return val == null ? (EMPTY_ARRAY as Seq<T>) : val;
}

export function isEmpty(val: unknown): boolean {
  if (val == null) return true;

  if (isArrayLike(val)) {
    return val.length === 0;
  }

  return next(val as Seq) == null;
}

export function map<In = unknown, Out = unknown>(
  f: Mapper<In, Out>,
  xs: Seq<In>
): Readonly<Out[]> {
  if (arguments.length !== 2) {
    throw new Error(
      "Wrong number of arguments expected 2, got: " + arguments.length
    );
  }

  if (xs == null || isEmpty(xs)) {
    return EMPTY_ARRAY as Readonly<Out[]>;
  }

  if (isArrayLike(xs)) {
    return Array.prototype.map.call(xs, f);
  }

  const a = [];
  while (xs != null) {
    a.push(f.call(xs, first(xs)));
    xs = next<In>(xs);
    if (isEmpty(xs)) break;
  }
  return Object.freeze(a);
}

export function reduce<Memo = unknown, Item = unknown>(
  f: Reducing<Memo, Item>,
  xs: Seq<Item>,
  init?: Memo
): Memo {
  if (arguments.length !== 2 && arguments.length !== 3) {
    throw new Error(
      "wrong number of arguments expected at least 2 or 3, got: " +
        arguments.length
    );
  }

  if (isEmpty(xs)) {
    return init;
  }

  let memo: Memo | Item;
  if (init == null) {
    memo = first<Item>(xs);
    xs = next<Item>(xs);
  }

  while (!isEmpty(xs)) {
    memo = f.call(xs, memo, first<Item>(xs));
    xs = next<Item>(xs);
  }

  return memo as Memo;
}

export function partition<T = unknown>(
  n: number,
  xs: Indexed<T>
): Readonly<[] | [Indexed<T>]> {
  if (isEmpty(xs)) {
    return EMPTY_ARRAY as Readonly<[]>;
  }

  if (xs.length === n) {
    return [xs];
  }

  const a = [];

  for (let i = 0; i < xs.length; i = i + n) {
    const x = [];
    for (let j = 0; j < n; j++) {
      x.push(xs[i + j]);
    }
    a.push(x);
  }

  return Object.freeze(a) as [Array<T>];
}

export function list(...args: unknown[]): List {
  let xs = List.EMPTY;

  for (let i = args.length - 1; i >= 0; i--) {
    xs = xs.cons(args[i]);
  }

  return xs;
}

export function meta(obj: Meta): Map<Keyword, unknown> {
  if (!isMeta(obj)) {
    console.error("not meta", obj);
    throw new Error("not meta");
  }

  return obj.meta();
}

export function getMeta(obj: Meta, key: Keyword): unknown {
  return meta(obj)?.get(key);
}

export function vector<T = unknown>(...args: T[]): Vector<T> {
  return new Vector<T>(args);
}

export function escapeHtml(str: string): string {
  return new Option(str).innerHTML;
}

export function gensym(template = "sym"): WSSymbol {
  const num = Math.floor(Math.random() * 100000);

  return WSSymbol.intern(`${template}${num}`);
}
