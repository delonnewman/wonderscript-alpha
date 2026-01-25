import { Dispatch, Recipient } from "./Dispatch";
import { Message } from "./Message";
import { Symbol } from "./Symbol";

export class Alien extends Symbol implements Recipient {
  readonly dispatch: Dispatch;

  constructor(object: Object, name: string, namespace?: string) {
    super(name, namespace);
    this.dispatch = new AlienDispatch(object);
  }
}

function getProperty(property: string) {
  return this[property];
}

export class AlienDispatch extends Dispatch {
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

    if (typeof method !== "function") {
      method = getProperty.bind(this.#object, msg.toString());
    }

    return method;
  }

  addMethod(msg: Message, method: Function) {
    this.#object[msg.toString()] = method;
  }
}
