import { Statement } from "./Statement";
import { Message } from "./Message";
import { Recipient } from "./Dispatch";
import { Symbol } from "./Symbol";
import { Ref } from "./Ref";

export class Script {
  #statements: Statement[];
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
    this.#statements.push(new Statement(subject, message));
    return this;
  }

  execute() {
    for (const statement of this.#statements) {
      statement.execute()
    }
  }
}
