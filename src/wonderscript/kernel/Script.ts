import { Statement } from "./Statement";
import { Message } from "./Message";
import { Recipient } from "./Dispatch";

export class Script {
  #statements: Statement[];

  constructor() {
    this.#statements = [];
  }

  get statements () {
    return Object.freeze(this.#statements.slice(0));
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
