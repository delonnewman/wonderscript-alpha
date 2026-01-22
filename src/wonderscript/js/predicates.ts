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

export function isInteger(val: unknown): val is number {
  return typeof val === "number" && Math.round(val) === val;
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
