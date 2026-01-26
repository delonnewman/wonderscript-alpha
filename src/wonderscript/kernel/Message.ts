import { Symbol } from "./Symbol";
import { Continuation } from "./Continuation";

export class Message {
  readonly name: Symbol;
  readonly args?: Readonly<unknown[]>;
  readonly continuation?: Continuation;

  static intern(
    value: string,
    options: { continue?: Continuation; args?: Readonly<unknown[]> } = {}
  ) {
    const symbol = Symbol.intern(value);
    return new this(symbol, options.continue, options.args);
  }

  constructor(
    name: Symbol,
    continuation?: Continuation,
    args?: Readonly<unknown[]>
  ) {
    this.name = name;
    this.args ??= args;
    this.continuation ??= continuation;
  }

  isQuery() {
    return this.continuation !== undefined;
  }

  isUnary() {
    return this.args === undefined;
  }

  toString() {
    if (this.isUnary()) {
      return this.name.toString();
    }
    return `${this.name.toString()}$${this.args.length}`;
  }
}
