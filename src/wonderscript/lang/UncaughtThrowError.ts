import { prStr } from "../compiler";

export class UncaughtThrowError extends Error {
  constructor(tag: unknown) {
    super(`uncaught throw ${prStr(tag)}`);
  }
}
