import { Message } from "../Message";
import { prStr } from "../../compiler/prStr";
import { BaseClass } from "./BaseClass";

export class JSConstructorClass extends BaseClass {
  #object: Function;

  constructor(object: Function, namespace?: string) {
    super(object.name, namespace);
    this.#object = object;
  }

  defineMethod(msg: Message, dispatch: Function) {
    this.#object.prototype[msg.interned] = dispatch;
    return msg;
  }

  findMethod(msg: Message) {
    const method = this.#object.prototype[msg.interned];
    if (method !== undefined) return method;

    throw new Error(`unknown method ${prStr(msg)} for an instance of ${this}`);
  }
}
