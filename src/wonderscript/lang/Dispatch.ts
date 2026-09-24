import { Message } from "./Message";
import { ObjectPool, ObjectValue } from "./Object";
import { Symbol } from "./Symbol";
import { Context } from "./Context";

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

export type ObjectRef = ObjectValue | Symbol;

export interface Dispatch {
  dispatch(ctx: Context): unknown;
}

export interface SequentialDispatch extends Dispatch {
  then(message: Message): Dispatch;
}

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

  dispatch(ctx: Context): unknown {
    if (this.subject instanceof Dialog) {
      return this.subject.dispatch(ctx);
    }

    let obj = this.subject;
    if (this.subject instanceof Symbol) {
      obj = ctx.lookup(this.subject).get(this.subject) as ObjectValue;
    }

    // TODO: will want to evaluate any variables in compound messages
    return ObjectPool.class(obj as ObjectValue).send(obj, this.message);
  }
}

export class Statement implements Message, Dispatch {
  #object: ObjectRef;
  #message: Message;

  constructor(object: ObjectRef, message: Message) {
    this.#object = object;
    this.#message = message;
  }

  get interned() {
    return `${this.#object}_${this.#message.interned}`
  }

  get object() {
    return this.#object;
  }

  get message() {
    return this.#message;
  }

  dispatch(ctx: Context) {
    let obj = this.object;
    if (this.object instanceof Symbol) {
      obj = ctx.lookup(this.object).get(this.object) as ObjectValue;
    }

    // TODO: will want to evaluate any variables in compound messages
    return ObjectPool.class(obj as ObjectValue).send(obj, this.message);
  }
}

export class Script implements SequentialDispatch {
  #statements: Statement[];

  static bind(obj: ObjectValue, msg: Message) {
    return new this().then(new Statement(obj, msg));
  }

  get statements() {
    return this.#statements;
  }

  constructor(statements: Statement[] = []) {
    this.#statements = statements;
  }

  then(statement: Statement) {
    this.#statements.push(statement);
    return this;
  }

  dispatch(ctx: Context) {
    for (const statement of this.#statements) {
      statement.dispatch(ctx);
    }
    return this;
  }
}

// new Script().bind(1, Message.build([Symbol.intern("+"), 1])).then(Message.build([Symbol.intern('*'), 5])).return(new Context()); // => 10
