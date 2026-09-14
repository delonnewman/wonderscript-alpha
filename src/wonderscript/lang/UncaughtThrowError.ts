import { Context } from "./Context";

export class UncaughtThrowError extends Error {
  constructor(nested: Error | string, scope?: Context) {
    if (nested instanceof Error) {
      super(nested.message);
      this.stack = nested.stack;
    } else {
      super(nested);
    }
    if (scope) {
      const first = `${this.message}\n${scope.stacktrace().toString()}`;
      this.stack = this.stack?.replace(this.message, first);
    }
  }
}
