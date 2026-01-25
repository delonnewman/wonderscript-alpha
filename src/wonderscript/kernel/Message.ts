import { Ref } from "./Ref";

export class Message {
  readonly name: string;
  readonly namespace?: string;
  readonly args?: Readonly<unknown[]>;
  readonly ref?: Ref;

  static intern(value: string, options: { ref?: Ref, args?: Readonly<unknown[]> }) {
    const [x, y] = value.split('$');

    let name: string, ns: string | undefined;
    if (y) {
      ns = x;
      name = y;
    } else {
      name = x;
    }

    return new Message(name, ns, options.ref, options.args);
  }

  constructor(
    name: string,
    namespace?: string,
    ref?: Ref,
    args?: Readonly<unknown[]>
  ) {
    this.name = name;
    this.namespace ??= namespace;
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
      return this.name;
    }
    return `${str}$${this.args.length}`;
  }
}
