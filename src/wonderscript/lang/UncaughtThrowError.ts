import { prStr } from "../compiler";

export class UncaughtThrowError extends Error {
  readonly nested: unknown
  constructor(nested: unknown) {
    super(`uncaught throw ${prStr(nested)}`);
    this.nested = nested;
  }
}
