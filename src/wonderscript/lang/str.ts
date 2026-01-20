const EMPTY_STRING: "" = "";

export function str(...args: unknown[]): string {
  if (args.length === 0) return EMPTY_STRING;
  return Array.prototype.join.call(arguments, EMPTY_STRING);
}
