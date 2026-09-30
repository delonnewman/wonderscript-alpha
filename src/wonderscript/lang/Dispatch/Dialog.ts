import { Message } from "../Message";
import { ObjectPool, ObjectValue } from "../ObjectPool";
import { Context } from "../Context";
import { Symbol } from "../Symbol";
import { Dispatch, isDispatch, SequentialDispatch } from "../Dispatch";

export type DialogSubject = ObjectValue | Dispatch;
export type DialogMessage = Message | Dispatch;

export class Dialog implements SequentialDispatch {
  #subject: DialogSubject;
  #message: DialogMessage;

  static bind(obj: ObjectValue, msg: Message) {
    return new this(obj, msg);
  }

  get subject() {
    return this.#subject;
  }

  get message() {
    return this.#message;
  }

  constructor(subject: DialogSubject, message: DialogMessage) {
    this.#subject = subject;
    this.#message = message;
  }

  then(msg: DialogMessage) {
    return new Dialog(this, msg);
  }

  dispatch(pool: ObjectPool, ctx: Context): unknown {
    let obj = this.subject;
    if (isDispatch(obj)) {
      obj = obj.dispatch(pool, ctx) as ObjectValue;
    }
    if (obj instanceof Symbol) {
      obj = ctx.lookup(obj).get(obj) as ObjectValue;
    }

    let msg = this.message;
    if (isDispatch(msg)) {
      msg = msg.dispatch(pool, ctx) as Message;
    }

    return pool.send(obj, msg);
  }
}

