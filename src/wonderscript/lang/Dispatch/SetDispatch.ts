import { Dispatch } from "../Dispatch";
import { Set } from "../Set";

export class SetDispatch implements Dispatch {
  #set: Set;

  constructor(set: Set) {
    this.#set = set;
  }

  dispatch(pool: any, ctx: any): Set {
    const result: Set = new Set();
    for (const value of this.#set) {
      result.add(value.dispatch(pool, ctx));
    }
    return result;
  }
}