import { Context } from "../lang/Context";

export class CompilerError extends Error {
  constructor(message: string, scope: Context) {
    super(`${message}:\n${scope.stacktrace()}`);
  }
}
