import { hashCode, hashCombine } from "./utils";
import { Hashable } from "./Value";
import { Form } from "../compiler/core";

const HASH_SEED = 597172124171148;

export class Hash extends Map implements Hashable {
  get interned() {
    const keys = Array.from(this.keys()).join('_');
    return `Hash_${keys}`;
  }

  hashCode() {
    let n = HASH_SEED;
    for (let entry of this) {
      n = hashCombine(n, hashCombine(hashCode(entry[0]), hashCode(entry[1])));
    }
    return n;
  }
}