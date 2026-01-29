import { Symbol } from "./Symbol";

export class Message {
  readonly name: Symbol;
  readonly args?: Readonly<unknown[]>;

  static intern(
    value: string,
    options: { args?: Readonly<unknown[]> } = {}
  ) {
    const symbol = Symbol.intern(value);
    return new this(symbol, options.args);
  }

  constructor(
    name: Symbol,
    args?: Readonly<unknown[]>
  ) {
    this.name = name;
    this.args ??= args;
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
