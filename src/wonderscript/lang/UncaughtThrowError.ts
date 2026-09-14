import { Context } from "./Context";

export class UncaughtThrowError extends Error {
  constructor(nested: Error | string, scope?: Context) {
    const message = (nested as Error).message ?? nested;
    super(message as string);
    if (scope) {
      const first = `${this.message}\n${scope.stacktrace().toString()}`;
      this.stack = this.stack?.replace(this.message, first);
    }
  }
}
