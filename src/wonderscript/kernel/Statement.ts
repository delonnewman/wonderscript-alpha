import { Recipient } from "./Dispatch";
import { Message } from "./Message";

export class Statement {
  readonly subject: Recipient;
  readonly message: Message;

  constructor(subject: Recipient, message: Message) {
    this.subject = subject;
    this.message = message;
  }

  bind() {
    return this.subject.dispatch.lookup(this.message).bind(this.subject);
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
