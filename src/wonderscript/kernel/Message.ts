import { Symbol } from "./Symbol";

export class Message extends Symbol {
  readonly args: Readonly<unknown[]>
  
  constructor(name: string, namespace?: string, args: Readonly<unknown[]> = []) {
    super(name, namespace);
    this.args = args;
  }

  toString() {
    const str = super.toString();
    return `${str}$${this.args.length}`;
  }
}
