export function isString(val: unknown): val is string {
  return (
    typeof val === "string" ||
    Object.prototype.toString.call(val) === "[object String]"
  );
}

export function isInteger(val: unknown): val is number {
  return typeof val === "number" && Math.round(val) === val;
}

export function isIterator(val: unknown): val is Iterator<any> {
  return val != null && typeof val[Symbol.iterator] === "function";
}
