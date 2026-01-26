import { Dispatch, Recipient } from "./Dispatch";
import { Message } from "./Message";

export class Symbol implements Recipient {
  readonly name: string;
  readonly namespace?: string;
  readonly dispatch: Dispatch;

  static intern(value: string) {
    const [x, y] = value.split("$");

    let name: string, ns: string | undefined;
    if (y) {
      ns = x;
      name = y;
    } else {
      name = x;
    }

    return new this(name, ns);
  }

  constructor(name: string, namespace?: string) {
    this.name = name;
    this.namespace ??= namespace;
    this.dispatch = new NativeDispatch(this);
  }

  toString() {
    if (!this.namespace) {
      return this.name;
    }
    return `${this.namespace}$${this.name}`;
  }
}

export class NativeDispatch extends Dispatch {
  #object: Object;

  constructor(object: Object) {
    super();
    this.#object = object;
  }

  lookup(msg: Message): Function {
    let method = this.#object[msg.toString()];
    if (method === undefined) {
      throw new Error(`Don't understand ${msg}`);
    }

    return method;
  }

  addMethod(msg: Message, method: Function) {
    this.#object[msg.toString()] = method;
  }
}
