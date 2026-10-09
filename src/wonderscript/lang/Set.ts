import { Binding } from "./Dispatch/Binding";
import { Message } from "./Message";
import { hashCode, hashCombine } from "./utils";
import { Hashable } from "./Value";

const HASH_SEED = 35030613777707380;

export class Set extends globalThis.Set implements Message, Hashable {
  bindings(msg: Message): readonly Binding[] {
    throw new Error("Method not implemented.");
  }

  get interned() {
    return `Set_${this.size}`;
  }

  get internings() {
    return [this.interned];
  }

  hashCode() {
    let n = HASH_SEED;
    for (let entry of this) {
      n = hashCombine(n, hashCode(entry));
    }
    return n;
  }
}