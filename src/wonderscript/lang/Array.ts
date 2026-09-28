import { hashCode, hashCombine } from "./utils";
import { Hashable } from "./Value";

const HASH_SEED = 12294658982929121;

export class Array extends globalThis.Array implements Hashable {
  hashCode() {
    let n = HASH_SEED;
    for (let entry of this) {
      n = hashCombine(n, hashCode(entry));
    }
    return n;
  }
}