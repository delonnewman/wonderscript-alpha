import {First, isSequence, Sequence} from "./Sequence";
import {Nil} from "./Nil";
import {CORE_NAMES} from "../compiler/constants";
import {dasherize, escapeChars} from "../compiler/utils";
import {CORE_MOD} from "../compiler/vars";
import {isMeta, Meta} from "./Meta";
import {Keyword} from "./Keyword";
import {Symbol as WSSymbol} from "./Symbol";
import {List} from "./List";
import {Vector} from "./Vector";

export {hashCode} from "./utils"

const EMPTY_ARRAY  = Object.freeze([]);
const EMPTY_STRING = "";

export function isString(x): x is string {
    return typeof x === 'string' || Object.prototype.toString.call(x) === '[object String]';
}

export function isObject(x): x is object {
    return Object.prototype.toString.call(x) === '[object Object]';
}

export function isUndefined(x): x is undefined {
    return x === void(0);
}

export function isNull(x): x is null {
    return x === null;
}

export function isBoolean(x): x is boolean {
    return Object.prototype.toString.call(x) === '[object Boolean]';
}

export function isNumber(x): x is number {
    return Object.prototype.toString.call(x) === '[object Number]';
}

export function isInteger(x): x is number {
    return isNumber(x) && Math.round(x) === x;
}

export function isArray(x): x is any[] {
    return Object.prototype.toString.call(x) === '[object Array]';
}

export function isSet(x): x is Set<any> {
    return Object.prototype.toString.call(x) === '[object Set]';
}

export function isMap(x): x is Map<any, any> {
    return Object.prototype.toString.call(x) === '[object Map]';
}

export type ArrayLike = {
    length: number
    [index: number]: unknown
}

export function isArrayLike(x): x is ArrayLike {
    return x != null && isNumber(x.length);
}

export function isFunction(x): x is Function {
    return Object.prototype.toString.call(x) === '[object Function]';
}

export function isIterator(x): x is Iterator<any> {
    return x != null && isFunction(x[Symbol.iterator]);
}

// NOTE: eventually this can go
export function str(...args): string {
    if (args.length === 0) return EMPTY_STRING;
    return Array.prototype.join.call(arguments, EMPTY_STRING);
}

type ConsMethod = { cons: (x) => any[] }
type Consable = ArrayLike | Nil | ConsMethod

const hasConsMethod = (col): col is ConsMethod => isFunction(col.cons)

export function cons(x, col: Consable): Readonly<any[]> | string {
    if (col == null) return [x];

    if (hasConsMethod(col)) {
        return col.cons(x);
    }

    if (isArrayLike(col)) {
        if (isString(col)) {
            return [x, col].join('');
        }
        else {
            return [x].concat(col);
        }
    }

    throw new Error("Cannot cons and element to: " + col);
}

type FirstMethod = { first: () => any | Nil }
type Firstable = FirstMethod | ArrayLike | Map<any, any> | Set<any>

const hasFirstMethod = (col): col is FirstMethod => isFunction(col.first)

export function first(col: Firstable): First {
    if (col == null) return null;

    if (hasFirstMethod(col)) {
        return col.first();
    }

    if (isArrayLike(col)) {
        return col[0] || null;
    }

    if (isIterator(col)) {
        return col[Symbol.iterator]().next().value || null
    }

    throw new Error("Cannot get the first element of: " + col);
}

type ForEachMethod = { forEach: (x) => void }
type Nextable = Sequence | ArrayLike | ForEachMethod

const hasForEachMethod = (col): col is ForEachMethod => isFunction(col.forEach)

export function next(col: Nextable): Readonly<any[]> | Sequence | Nil {
    if (col == null) return null;

    if (isSequence(col)) {
        return col.next();
    }

    if (isArrayLike(col)) {
        if (col.length === 0) {
            return null;
        }
        else {
            return Array.prototype.slice.call(col, 1);
        }
    }

    if (hasForEachMethod(col)) {
        const a = [];
        let i = 0;
        col.forEach(function (val) {
            if (i > 0) {
                a.push(val);
            }
            i++
        });
        return i === 0 ? null : a
    }

    throw new Error("Cannot get the next element of: " + col);
}

export function rest(col: Nextable): Readonly<any[]> | Sequence {
    const val = next(col)

    return val == null ? EMPTY_ARRAY : val;
}

export function isEmpty(x): boolean {
    if (x == null) return true;

    if (isArrayLike(x)) {
        return x.length === 0;
    }

    return next(x) == null;
}

type Mapper<In, Out> = (x: In) => Out
type Mappable = ArrayLike | Sequence | Map<any, any> | Set<any>

export function map<In = any, Out = unknown>(f: Mapper<In, Out>, xs: Mappable): Readonly<Out[]> {
    if (arguments.length !== 2) {
        throw new Error('Wrong number of arguments expected 2, got: ' + arguments.length);
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
        xs = next(xs);
        if (isEmpty(xs)) break;
    }
    return Object.freeze(a);
}

type Reducing = (a: any, b: any) => any

export function reduce(f: Reducing, xs, init?: any) {
    if (arguments.length !== 2 && arguments.length !== 3) {
        throw new Error('wrong number of arguments expected at least 2 or 3, got: ' + arguments.length);
    }

    if (init == null) {
        init = first(xs);
        xs = next(xs);
    }

    if (isEmpty(xs)) {
        return init;
    }

    let memo = init;

    while (!isEmpty(xs)) {
        memo = f.call(xs, memo, first(xs));
        xs = next(xs);
    }

    return memo;
}

export function partition(n: number, xs: ArrayLike): Readonly<any[]> {
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
    return a;
}

export function list(...args): List {
    let xs = List.EMPTY;

    for (let i = args.length - 1; i >= 0; i--) {
        xs = xs.cons(args[i]);
    }

    return xs;
}

export function meta(obj: Meta): Map<Keyword, any> {
    if (!isMeta(obj)) {
        console.error("not meta", obj);
    }

    return obj.meta();
}

export function getMeta(obj: Meta, key: Keyword): any {
    return meta(obj)?.get(key);
}

export function merge(...maps: Map<any, any>[]): Map<any, any> {
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

export function vector(...args): Vector {
    return new Vector(args);
}

export function escapeHtml(str: string): string {
    return new Option(str).innerHTML;
}

export function gensym(template = "sym"): WSSymbol {
    const num = Math.floor(Math.random() * 100000);

    return WSSymbol.intern(`${template}${num}`);
}

export function importSymbol(name: string, obj) {
    let wsName = CORE_NAMES[name];

    if (name[0] === name[0].toUpperCase()) { // Don't escape names that start with uppercase
        wsName = name
    }
    else if (wsName) {
        wsName = escapeChars(dasherize(wsName));
    }
    else if (name.startsWith('is')) {
        wsName = str(name.slice(2).toLowerCase(), '?');
        wsName = escapeChars(dasherize(wsName));
    }
    else {
        wsName = escapeChars(dasherize(name));
    }

    CORE_MOD[wsName] = obj;
}

export function importModule(module) {
    Object.keys(module).forEach(function(name) {
        importSymbol(name, module[name]);
    });
}
