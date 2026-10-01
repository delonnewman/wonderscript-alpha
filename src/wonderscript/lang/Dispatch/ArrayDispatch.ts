import { Dispatch } from "../Dispatch";
import { Array } from "../Array";
import { ObjectPool } from "../ObjectPool";
import { Context } from "../Context";

export class ArrayDispatch implements Dispatch {
  #array: Array;

  constructor(array: Array) {
    this.#array = array;
  }

  dispatch(pool: ObjectPool, ctx: Context): Array {
    const result: Array = new Array();
    for (const value of this.#array) {
      result.push(value.dispatch(pool, ctx));
    }
    return result;
  }
}