import { Named, namespace, name } from "./Named";
import { Keyword } from "./Keyword";
import { Symbol } from "./Symbol";
import { EMPTY_ARRAY, Message } from "./Message";
import { Dispatch } from "./Dispatch";
import { Method } from "./Method";

export class Class implements Named, Message {
  #name: string;
  #namespace: string | undefined;
  #methods: Record<string, Method> = Object.create(null);
  #messages: Message[] = [];
  #subclasses: Class[] = [];

  constructor(name: string, namespace: string | null | undefined) {
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

    return `${this.#namespace.replace('.', '_')}$_${this.#name}`;
  }

  get internings() {
    return [this.interned];
  }

  bindings(_: Message) {
    return EMPTY_ARRAY;
  }

  defineMethod(msg: Message, dispatch: Dispatch) {
    this.#messages.push(msg);
    this.#methods[msg.interned] = new Method(msg, dispatch);
    return msg;
  }

  hasMethod(name: string): boolean {
    return this.#methods[name] !== undefined;
  }

  findMethod(msg: Message) {
    const method = this.#methods[msg.interned];
    if (method !== undefined) return method;

    throw new Error(`unknown method ${msg} for class ${this}`);
  }

  get subclasses() {
    return Array.from(this.#subclasses);
  }

  subclass(subclassName: string | Keyword | Symbol) {
    const ns = namespace(subclassName);
    const nm = name(subclassName);

    const subclass = new (this.constructor as typeof Class)(nm, ns);
    this.#subclasses.push(subclass);

    return subclass;
  }

  get messages(): Message[] {
    return Array.from(this.#messages);
  }

  toString() {
    if (this.namespace) {
      return `${this.namespace}/${this.name}`;
    }

    return this.name;
  }
}
