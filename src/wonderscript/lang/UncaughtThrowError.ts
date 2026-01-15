import { prStr } from "../compiler";

export class UncaughtThrowError extends Error {
  constructor(tag: unknown) {
    super(`UncaughtThrowError: uncaught throw ${prStr(tag)}`);
  }
}
