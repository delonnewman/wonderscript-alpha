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

export class Action implements Message, Dispatch {
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

export class Binding {
  #name: Symbol;
  #action: Action;

  constructor(name: Symbol, action: Action) {
    this.#name = name;
    this.#action = action;
  }

  get action() {
    return this.#action;
  }

  get name() {
    return this.#name;
  }
}

export class Script implements SequentialDispatch {
  #actions: Action[];
  #bindings: Binding[];
  #result: unknown;

  constructor(actions: Action[] = [], bindings: Binding[] = []) {
    this.#actions = actions;
    this.#bindings = bindings;
  }

  get result() {
    return this.#result;
  }

  get actions() {
    return Array.from(this.#actions);
  }

  get bindings() {
    return Array.from(this.#bindings);
  }

  bind(name: Symbol, action: Action) {
    this.#bindings.push(new Binding(name, action));
    return this;
  }

  then(action: Action) {
    this.#actions.push(action);
    return this;
  }

  dispatch(ctx: Context) {
    for (const binding of this.#bindings) {
      ctx.define(binding.name, binding.action.dispatch(ctx));
    }
    for (const action of this.#actions.slice(0, this.#actions.length - 1)) {
      action.dispatch(ctx);
    }
    this.#result = this.#actions[this.#actions.length - 1].dispatch(ctx);
    return this;
  }
}

// new Script().bind(1, Message.build([Symbol.intern("+"), 1])).then(Message.build([Symbol.intern('*'), 5])).return(new Context()); // => 10
