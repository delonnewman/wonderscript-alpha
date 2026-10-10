import { Message } from "../Message";
import { prStr } from "../../compiler/prStr";
import { BaseClass } from "./BaseClass";

export class JSSingletonClass extends BaseClass {
  #object: Object;

  constructor(object: Object, name: string, namespace?: string) {
    super(name, namespace);
    this.#object = object;
  }

  defineMethod(msg: Message, dispatch: Function) {
    this.#object[msg.interned] = dispatch;
    return msg;
  }

  findMethod(msg: Message) {
    const method = this.#object[msg.interned];
    if (method !== undefined) return method.bind(this.#object);

    throw new Error(`unknown method ${prStr(msg)} for an instance of ${this}`);
  }
}
