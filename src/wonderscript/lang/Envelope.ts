import { ObjectValue } from "./Object";
import { Message } from "./Message";

export class Envelope {
  #object: ObjectValue;
  #message: Message;

  constructor(object: ObjectValue, message: Message) {
    this.#object = object;
    this.#message = message;
  }

  get object() {
    return this.#object;
  }

  get message() {
    return this.#message;
  }
}