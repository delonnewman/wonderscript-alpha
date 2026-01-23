import { Ref } from "./Ref";
import { Message } from "./Message";

export class Query {
  #ref: Ref;
  #object: Object;
  
  constructor(ref: Ref, object: Object) {
    this.#ref = ref;
    this.#object = object;
  }

  ask(message: Message) {
    let value = this.#object[message.name]
    if (typeof value === "function") {
      value = value.apply(this.#object, message.args);
    }
    this.#ref.set(value);
  }
}
