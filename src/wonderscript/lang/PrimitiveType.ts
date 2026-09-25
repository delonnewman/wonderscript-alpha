import { Message } from "./Message";
import { Named } from "./Named";
import { Class } from "./Class";

export class PrimitiveType extends Class implements Named, Message {
  #interned: string;

  constructor(name: string, namespace?: string) {
    super(name, namespace);
    this.#interned = name;
  }

  get interned() {
    return this.#interned;
  }
}
