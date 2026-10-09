import {
  DispatchMessage, DispatchSubject, isDispatch,
  SequentialDispatch,
} from "../Dispatch";
import { Meta, MetaData } from "../Meta";
import { merge } from "../merge";
import { ObjectPool, ObjectValue } from "../ObjectPool";
import { Context } from "../Context";
import { Symbol } from "../Symbol";
import { Message } from "../Message";

export class Dialog implements SequentialDispatch, Meta {
  #subject: DispatchSubject;
  #message: DispatchMessage;
  #meta: MetaData | undefined;

  constructor(
    subject: DispatchSubject,
    message: DispatchMessage,
    meta?: MetaData
  ) {
    this.#subject = subject;
    this.#message = message;
    this.#meta = meta;
  }

  get subject(): DispatchSubject {
    return this.#subject;
  }

  get message(): DispatchMessage {
    return this.#message;
  }

  meta() {
    return this.#meta;
  }

  hasMeta(): boolean {
    return this.#meta != null && this.#meta.size > 0;
  }

  withMeta(data: MetaData): Meta {
    return new (this.constructor as any)(
      this.#subject,
      this.#message,
      merge(this.#meta, data)
    );
  }

  then(msg: DispatchMessage) {
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

    // TODO: this could be a good place to implement an inline cache
    const method = pool.select(obj, msg);
    const binds = method.message.bindings(msg);
    for (const bind of binds) {
      ctx.define(bind.name, bind.dispatch(pool, ctx));
    }

    return method.dispatch.dispatch(pool, ctx);
  }
}
