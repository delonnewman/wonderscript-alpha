import { Dispatch } from "../Dispatch";
import { Hash } from "../Hash";

export class HashDispatch implements Dispatch {
  #hash: Hash;

  constructor(hash: Hash) {
    this.#hash = hash;
  }

  dispatch(pool: any, ctx: any): Hash {
    const result: Hash = new Hash();
    for (const [key, value] of this.#hash.entries()) {
      result.set(key.dispatch(pool, ctx), value.dispatch(pool, ctx));
    }
    return result;
  }
}