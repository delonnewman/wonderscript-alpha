import { Message } from "./Message";
import { Recipient } from "./Dispatch";

export type TransmissionOptions = {
  sender?: Recipient;
};

export class Transmission {
  readonly reciever: Recipient;
  readonly message: Message;
  readonly sender?: Recipient;

  constructor(
    subject: Recipient,
    message: Message,
    options: TransmissionOptions = {}
  ) {
    this.reciever = subject;
    this.message = message;
    this.sender ??= options.sender;
  }

  isRequest() {
    return this.sender !== undefined;
  }

  bind() {
    const method = this.reciever.dispatch.lookup(this.message);
    return method.bind(this);
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
