import { hashCode, hashCombine } from "./utils";
import { Hashable } from "./Value";
import { Message } from "./Message";
import { Binding } from "./Dispatch/Binding";

const HASH_SEED = 597172124171148;

export class Hash extends Map implements Hashable, Message {
  hashCode() {
    let n = HASH_SEED;
    for (let entry of this) {
      n = hashCombine(n, hashCombine(hashCode(entry[0]), hashCode(entry[1])));
    }
    return n;
  }

  bindings(msg: Message): readonly Binding[] {
    throw new Error("Method not implemented.");
  }

  get interned() {
    const keys = Array.from(this.keys()).join("_");
    return `Hash_${keys}`;
  }

  get internings(): string[] {
    return [this.interned, `${this.interned}_splat`];
  }
}