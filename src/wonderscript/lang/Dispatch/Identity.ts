import { ObjectPool } from "../ObjectPool";
import { Context } from "../Context";
import { Dispatch } from "../Dispatch";
import { prStr } from "../../compiler";

export class Identity<T = unknown> implements Dispatch {
  #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  dispatch(_pool: ObjectPool, _ctx: Context): T {
    return this.#value;
  }

  toString(): string {
    return `#<Identity ${prStr(this.#value)}>`;
  }
}