import { Named } from "../Named";
import { EMPTY_ARRAY, Message } from "../Message";

export abstract class BaseClass implements Named, Message {
  #name: string;
  #namespace: string | undefined;

  protected constructor(
    name: string,
    namespace: string | undefined,
  ) {
    this.#name = name;
    this.#namespace = namespace;
  }

  get name() {
    return this.#name;
  }

  get namespace() {
    return this.#namespace;
  }

  get interned() {
    if (this.#namespace == null) {
      return this.#name;
    }

    return `${this.#namespace.replace(".", "_")}$_${this.#name}`;
  }

  get internings() {
    return [this.interned];
  }

  bindings(_: Message) {
    return EMPTY_ARRAY;
  }

  abstract defineMethod(msg: Message, dispatch: unknown): Message
  abstract findMethod(msg: Message): unknown

  toString() {
    if (this.namespace) {
      return `${this.namespace}/${this.name}`;
    }

    return this.name;
  }
}
