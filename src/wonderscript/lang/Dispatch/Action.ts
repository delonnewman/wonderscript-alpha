import { Message } from "../Message";
import { ObjectPool, ObjectValue } from "../ObjectPool";
import { Context } from "../Context";
import { Symbol } from "../Symbol";
import { Dispatch, ObjectRef } from "../Dispatch";

export class Action implements Message, Dispatch {
  #object: ObjectRef;
  #message: Message;

  constructor(object: ObjectRef, message: Message) {
    this.#object = object;
    this.#message = message;
  }

  get interned() {
    return `${this.#object}_${this.#message.interned}`;
  }

  get object() {
    return this.#object;
  }

  get message() {
    return this.#message;
  }

  dispatch(pool: ObjectPool, ctx: Context) {
    let obj = this.object;
    if (this.object instanceof Symbol) {
      obj = ctx.lookup(this.object).get(this.object) as ObjectValue;
    }

    // TODO: will want to evaluate any variables in compound messages
    return pool.class(obj as ObjectValue).send(obj, this.message);
  }
}

