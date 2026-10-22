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
import { pt } from "../../util";

export class Dialog implements SequentialDispatch, Meta {
  #subject: DispatchSubject;
  #message: DispatchMessage;
  #meta: MetaData | undefined;

  static inspect() {
    return this.name;
  }

  constructor(
    subject: DispatchSubject,
    message: DispatchMessage,
    meta?: MetaData
  ) {
    this.#subject = subject;
    this.#message = message;
    this.#meta = meta;
  }

  inspect() {
    return this.toString();
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

  toString() {
    return `#<Dialog ${this.#subject} => ${this.#message}>`;
  }

  dispatch(pool: ObjectPool, ctx: Context): unknown {
    let obj = this.subject;
    if (isDispatch(obj)) {
      obj = obj.dispatch(pool, ctx) as ObjectValue;
    } else if (obj instanceof Symbol) {
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
    ctx.define(Symbol.intern("self"), obj);

    const binds = method.bindings(msg);
    for (const bind of binds) {
      ctx.define(bind.name, bind.action);
    }

    return method.dispatch(pool, ctx);
  }

  array_0(pool: ObjectPool, ctx: Context) {
    return this.dispatch(pool, ctx);
  }
}
