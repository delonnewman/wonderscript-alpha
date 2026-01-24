import { Symbol } from "./Symbol";
import { Ref } from "./Ref";

export class Message extends Symbol {
  readonly args: Readonly<unknown[]>;
  readonly ref?: Ref;

  constructor(
    name: string,
    namespace?: string,
    ref?: Ref,
    args?: Readonly<unknown[]>
  ) {
    super(name, namespace);
    this.args = args;
    this.ref = ref;
  }

  isQuery() {
    return this.ref !== undefined;
  }

  isUnary() {
    return this.args === undefined;
  }

  toString() {
    const str = super.toString();
    if (this.isUnary()) {
      return str;
    }
    return `${str}$${this.args.length}`;
  }
}
