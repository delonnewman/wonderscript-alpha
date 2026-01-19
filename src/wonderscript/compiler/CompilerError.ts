import { Context } from "../lang/Context";

export class CompilerError extends Error {
  readonly scope: Context;

  constructor(message: string, scope: Context) {
    super(message);
    this.scope = scope;
  }
}
