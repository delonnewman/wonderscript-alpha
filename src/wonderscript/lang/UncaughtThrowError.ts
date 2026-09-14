import { Context } from "./Context";

export class UncaughtThrowError extends Error {
  constructor(nested: Error | string, trace?: string) {
    if (nested instanceof Error) {
      super(nested.message);
      this.stack = nested.stack;
    } else {
      super(nested);
    }
    if (trace) {
      const first = `${this.message}\n${trace}`;
      this.stack = this.stack?.replace(this.message, first);
    }
  }
}
