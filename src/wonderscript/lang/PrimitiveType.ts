import { Message } from "./Message";
import { Named } from "./Named";
import { Class } from "./Class";
import { ObjectPool, ObjectType, ObjectValue } from "./Object";

export class PrimitiveType extends Class implements Named, Message {
  #interned: string;

  constructor(obj: ObjectValue, name: string, namespace?: string) {
    super(obj, name, namespace);
    this.#interned = name;
  }

  get interned() {
    return this.#interned;
  }

  allocate() {
    return ObjectPool.allocate(this, ObjectType.VALUE);
  }
}
