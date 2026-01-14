import { Seq, first, next } from "./Seq";
import { isArrayLike } from "./ArrayLike";
import { CORE_NAMES } from "../compiler/constants";
import { dasherize, escapeChars } from "../compiler/utils";
import { CORE_MOD } from "../compiler/vars";
import { isMeta, Meta } from "./Meta";
import { Keyword } from "./Keyword";
import { Symbol as WSSymbol } from "./Symbol";
import { List } from "./List";
import { Vector } from "./Vector";

export { hashCode } from "./utils";
export { cons, first, next, isSequence } from "./Seq";
export { isArrayLike, ArrayLike } from "./ArrayLike";

const EMPTY_ARRAY: Readonly<[]> = Object.freeze([]);
const EMPTY_STRING: "" = "";

export type Indexed<T = unknown> = Array<T> | ArrayLike<T> | Vector<T>;

type Mapper<In, Out> = (x: In) => Out;
type Reducing<Memo, Item> = (a: Memo, b: Item) => Memo;

export function isString(val: unknown): val is string {
  return (
    typeof val === "string" ||
    Object.prototype.toString.call(val) === "[object String]"
  );
}

export function isObject(val: unknown): val is object {
  return Object.prototype.toString.call(val) === "[object Object]";
}

export function isUndefined(val: unknown): val is undefined {
  return val === void 0;
}

export function isNull(val: unknown): val is null {
  return val === null;
}

export function isBoolean(val: unknown): val is boolean {
  return Object.prototype.toString.call(val) === "[object Boolean]";
}

export function isNumber(val: unknown): val is number {
  return Object.prototype.toString.call(val) === "[object Number]";
}

export function isInteger(val: unknown): val is number {
  return isNumber(val) && Math.round(val) === val;
}

export function isArray(val: unknown): val is unknown[] {
  return Object.prototype.toString.call(val) === "[object Array]";
}

export function isSet(val: unknown): val is Set<unknown> {
  return Object.prototype.toString.call(val) === "[object Set]";
}

export function isMap(val: unknown): val is Map<unknown, unknown> {
  return Object.prototype.toString.call(val) === "[object Map]";
}

export function isFunction(val: unknown): val is Function {
  return Object.prototype.toString.call(val) === "[object Function]";
}

export function isIterator(val: unknown): val is Iterator<any> {
  return val != null && isFunction(val[Symbol.iterator]);
}

export function str(...args: unknown[]): string {
  if (args.length === 0) return EMPTY_STRING;
  return Array.prototype.join.call(arguments, EMPTY_STRING);
}

export function rest<T = unknown>(col: Seq<T>): Seq<T> {
  const val = next(col);

  return val == null ? EMPTY_ARRAY : val;
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
    return EMPTY_ARRAY;
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
    return EMPTY_ARRAY;
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
  }

  return obj.meta();
}

export function getMeta(obj: Meta, key: Keyword): unknown {
  return meta(obj)?.get(key);
}

export function merge<K = unknown, V = unknown>(
  ...maps: Map<unknown, unknown>[]
): Map<K, V> {
  const merged = new Map();

  for (let i = 0; i < maps.length; i++) {
    const m = maps[i];
    if (m == null) continue; // ignore nullish values

    for (let entry of m) {
      merged.set(entry[0], entry[1]);
    }
  }

  return merged;
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

export function importSymbol(name: string, obj: unknown) {
  let wsName = CORE_NAMES[name];

  if (name[0] === name[0].toUpperCase()) {
    // Don't escape names that start with uppercase
    wsName = name;
  } else if (wsName) {
    wsName = escapeChars(dasherize(wsName));
  } else if (name.startsWith("is")) {
    wsName = str(name.slice(2).toLowerCase(), "?");
    wsName = escapeChars(dasherize(wsName));
  } else {
    wsName = escapeChars(dasherize(name));
  }

  CORE_MOD[wsName] = obj;
}

export function importModule(module: Object) {
  Object.keys(module).forEach((name) => {
    importSymbol(name, module[name]);
  });
}
