import { Message } from "./Message";
import { Recipient } from "./Dispatch";
import { Ref } from "./Ref";
import { Symbol } from "./Symbol";
import { Transmission } from "./Transmission";
import { Continuation } from "./Continuation";

export class Script {
  #transmissions: Continuation;
  #references: Map<string, Ref>;

  constructor() {
    this.#transmissions = new Continuation();
    this.#references = new Map();
  }

  get transmissions() {
    return this.#transmissions.toArray();
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
    this.#transmissions = this.#transmissions.append(new Transmission(subject, message));
    return this;
  }

  execute() {
    for (const transmission of this.transmissions) {
      transmission.execute();
    }
  }
}
