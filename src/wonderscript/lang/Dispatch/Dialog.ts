import { Message } from "../Message";
import { ObjectPool, ObjectValue } from "../ObjectPool";
import { Context } from "../Context";
import { Symbol } from "../Symbol";
import { Dispatch, isDispatch, SequentialDispatch } from "../Dispatch";
import { Meta, MetaData } from "../Meta";
import { merge } from "../merge";

export type DialogSubject = ObjectValue | Symbol | Dispatch;
export type DialogMessage = Message | Dispatch;

export class Dialog implements SequentialDispatch, Meta {
  #subject: DialogSubject;
  #message: DialogMessage;
  #meta: MetaData | undefined;

  static bind(obj: ObjectValue, msg: Message) {
    return new this(obj, msg);
  }

  get subject() {
    return this.#subject;
  }

  get message() {
    return this.#message;
  }

  constructor(subject: DialogSubject, message: DialogMessage, meta?: MetaData) {
    this.#subject = subject;
    this.#message = message;
    this.#meta = meta;
  }

  meta() {
    return this.#meta;
  }

  hasMeta(): boolean {
    return this.#meta != null && this.#meta.size === 0;
  }

  withMeta(data: MetaData): Dialog  {
    return new Dialog(this.#subject, this.#message, merge(this.#meta, data));
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
      ctx = ctx.lookup(obj);
      if (ctx == null) throw new Error(`undefined variable ${obj}`);
      obj = ctx.get(obj) as ObjectValue;
    }

    let msg = this.message;
    if (isDispatch(msg)) {
      msg = msg.dispatch(pool, ctx) as Message;
    }

    return pool.send(obj, msg);
  }
}

