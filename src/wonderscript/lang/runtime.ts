import {First, Next, Seq} from "./Seq";
import {Nil} from "./Nil";

const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_STRING = Object.freeze("");

export function isString(x): x is string | String {
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

export function cons(x, col: Consable): Readonly<any[] | string> {
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
type Firstable = FirstMethod | ArrayLike | Iterator<any>

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

type NextMethod = { next: () => any[] | Nil }
type ForEachMethod = { forEach: (x) => void }
type Nextable = NextMethod | ArrayLike | ForEachMethod

const hasNextMethod = (col): col is NextMethod => isFunction(col.next)
const hasForEachMethod = (col): col is ForEachMethod => isFunction(col.forEach)

export function next(col: Nextable): Readonly<any[]> | Nil {
    if (col == null) return null;

    if (hasNextMethod(col)) {
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
        var a = [], i = 0;
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

export function rest(col: Nextable): Readonly<any[]> {
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
type Mappable = ArrayLike | (FirstMethod & NextMethod)

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

export function partition(n: number, xs: ArrayLike): Readonly<any[]> {
    if (isEmpty(xs)) {
        return EMPTY_ARRAY;
    }
    else if (xs.length === n) {
        return [xs];
    }
    else {
        var a = [], i, j, x;
        for (i = 0; i < xs.length; i = i + n) {
            x = [];
            for (j = 0; j < n; j++) {
                x.push(xs[i + j]);
            }
            a.push(x);
        }
        return a;
    }
}

const META_SYMBOL = Symbol('wonderscriptMetaData');

export function setMeta(obj, key, value) {
    if (typeof obj === 'string') {
        obj = new String(obj);
    }
    else {
        const meta = obj[META_SYMBOL];
        if (!meta) obj[META_SYMBOL] = {};
        obj[META_SYMBOL][key] = value;
    }
    return obj;
}

export function resetMeta(obj, meta) {
    obj[META_SYMBOL] = meta;
    return obj;
}

export function meta(obj) {
    return obj[META_SYMBOL] || {};
}

export function getMeta(obj, key) {
    return meta(obj)[key];
}
