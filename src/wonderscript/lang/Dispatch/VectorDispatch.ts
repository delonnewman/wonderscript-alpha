import { Dispatch } from "../Dispatch";
import { ObjectPool } from "../ObjectPool";
import { Context } from "../Context";
import { Vector } from "../Vector";

export class VectorDispatch implements Dispatch {
  #vector: Vector;

  constructor(vector: Vector) {
    this.#vector = vector;
  }

  dispatch(pool: ObjectPool, ctx: Context): Vector {
    const result = [];
    for (const value of this.#vector) {
      result.push(value.dispatch(pool, ctx));
    }
    return new Vector(...result);
  }
}