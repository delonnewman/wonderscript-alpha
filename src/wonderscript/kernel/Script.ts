import { Message } from "./Message";
import { Recipient } from "./Dispatch";
import { Transmission } from "./Transmission";
import { Continuation } from "./Continuation";

export class Script {
  #transmissions: Continuation;

  constructor() {
    this.#transmissions = new Continuation();
  }

  get transmissions() {
    return this.#transmissions.toArray();
  }

  send(subject: Recipient, message: Message) {
    this.#transmissions = this.#transmissions.append(new Transmission(subject, message));
    return this;
  }

  execute() {
    // TODO: how will we pass the current continuation when requested?
    for (const transmission of this.transmissions) {
      transmission.execute();
    }
  }
}
