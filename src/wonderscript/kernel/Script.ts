import { Message } from "./Message";
import { Recipient } from "./Dispatch";
import { Ref } from "./Ref";
import { Symbol } from "./Symbol";
import { Transmission } from "./Transmission";

export class Script {
  #statements: Transmission[];
  #references: Map<string, Ref>;

  constructor() {
    this.#statements = [];
    this.#references = new Map();
  }

  get statements () {
    return Object.freeze(this.#statements.slice(0));
  }

  createReference(name: Symbol, value?: unknown) {
    const ref = new Ref(value);
    this.#references.set(name.toString(), ref);
    return ref;
  }

  dereference(name: Symbol) {
    return this.#references.get(name.toString()).deref();
  }

  send(subject: Recipient, message: Message) {
    this.#statements.push(new Transmission(subject, message));
    return this;
  }

  execute() {
    for (const statement of this.#statements) {
      statement.execute()
    }
  }
}
