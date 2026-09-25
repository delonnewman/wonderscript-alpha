import { Message } from "../Message";
import { ObjectPool, ObjectValue } from "../ObjectPool";
import { Context } from "../Context";
import { Symbol } from "../Symbol";
import { Dispatch, ObjectRef, SequentialDispatch } from "../Dispatch";

export class Dialog implements SequentialDispatch {
  #subject: ObjectRef | Dialog;
  #message: Message;

  static bind(obj: ObjectRef, msg: Message) {
    return new this(obj, msg);
  }

  get subject() {
    return this.#subject;
  }

  get message() {
    return this.#message;
  }

  constructor(subject: ObjectRef | Dialog, message: Message) {
    this.#subject = subject;
    this.#message = message;
  }

  then(msg: Message) {
    return new Dialog(this, msg);
  }

  dispatch(pool: ObjectPool, ctx: Context): unknown {
    if (this.subject instanceof Dialog) {
      return this.subject.dispatch(pool, ctx);
    }

    let obj = this.subject;
    if (this.subject instanceof Symbol) {
      obj = ctx.lookup(this.subject).get(this.subject) as ObjectValue;
    }

    // TODO: will want to evaluate any variables in compound messages
    return pool.class(obj as ObjectValue).send(obj, this.message);
  }
}

