import { hashCode, hashCombine } from "./utils";
import { Hashable } from "./Value";
import { Message } from "./Message";

const HASH_SEED = 12294658982929121;

export class Array extends globalThis.Array implements Hashable, Message {
  hashCode() {
    let n = HASH_SEED;
    for (let entry of this) {
      n = hashCombine(n, hashCode(entry));
    }
    return n;
  }

  get interned(): string {
    return `array_${this.length}`;
  }

  get internings(): string[] {
    return [this.interned, `${this.interned}_splat`];
  }
}