import { Ref } from "./Ref";
import { Symbol } from "./Symbol";

export class Message {
  readonly name: Symbol;
  readonly args?: Readonly<unknown[]>;
  readonly ref?: Ref;

  static intern(
    value: string,
    options: { ref?: Ref; args?: Readonly<unknown[]> } = {}
  ) {
    const symbol = Symbol.intern(value);
    return new this(symbol, options.ref, options.args);
  }

  constructor(
    name: Symbol,
    ref?: Ref,
    args?: Readonly<unknown[]>
  ) {
    this.name = name;
    this.args ??= args;
    this.ref ??= ref;
  }

  isQuery() {
    return this.ref !== undefined;
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
