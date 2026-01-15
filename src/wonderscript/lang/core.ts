const EMPTY_STRING: "" = "";

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
