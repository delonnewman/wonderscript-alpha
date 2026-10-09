import { Message } from "./Message";
import { ObjectPool, ObjectValue } from "./ObjectPool";
import { Context } from "./Context";
import { Symbol } from "./Symbol";
import { Meta, MetaData } from "./Meta";
import { merge } from "./merge";

export * from "./Dispatch/Binding";
export * from "./Dispatch/Dialog";
export * from "./Dispatch/Script";

/**
 * Example:
 *   (begin
 *     (js/console log "Hi!")
 *     :done)
 *
 * Example:
 *    (let [a 1 b (a + 2)]
 *      (js/console log a b)
 *      (a + b))
 */

export type DispatchSubject = ObjectValue | Symbol | Dispatch;
export type DispatchMessage = Message | Dispatch;

export interface Dispatch {
  dispatch(pool: ObjectPool, ctx: Context): unknown;
}

export interface SequentialDispatch extends Dispatch {
  then(message: DispatchMessage): Dispatch;
}

export function isDispatch(obj: unknown): obj is Dispatch {
  return obj != null && typeof (obj as Dispatch).dispatch === "function";
}

// new Script().bind(1, Message.build([Symbol.intern("+"), 1])).then(Message.build([Symbol.intern('*'), 5])).return(new Context()); // => 10

export abstract class BaseDispatch implements Meta {
  #subject: DispatchSubject;
  #message: DispatchMessage;
  #meta: MetaData | undefined;

  constructor(subject: DispatchSubject, message: DispatchMessage, meta?: MetaData) {
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