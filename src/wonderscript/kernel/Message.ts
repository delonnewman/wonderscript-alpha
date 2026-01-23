import { Symbol } from "./Symbol";
import { Ref } from "./Ref";

// Queries are messages with a ref
export class Message extends Symbol {
  readonly args: Readonly<unknown[]>;
  readonly ref?: Ref;

  constructor(
    name: string,
    namespace?: string,
    ref?: Ref,
    args: Readonly<unknown[]> = []
  ) {
    super(name, namespace);
    this.args = args;
    this.ref = ref;
  }

  toString() {
    const str = super.toString();
    return `${str}$${this.args.length}`;
  }
}
