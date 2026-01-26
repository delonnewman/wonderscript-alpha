import { Recipient } from "./Dispatch";
import { Message } from "./Message";

export class Transmission {
  readonly subject: Recipient;
  readonly message: Message;

  constructor(subject: Recipient, message: Message) {
    this.subject = subject;
    this.message = message;
  }

  isQuery() {
    return this.message.isQuery();
  }

  bind() {
    const method = this.subject.dispatch.lookup(this.message);
    return method.bind(this.subject);
  }

  execute() {
    const method = this.bind();
    if (this.message.isUnary()) {
      method();
    } else {
      method(...this.message.args);
    }
  }
}
