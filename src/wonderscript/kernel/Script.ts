import { Message } from "./Message";
import { Recipient } from "./Dispatch";
import { Transmission, TransmissionOptions } from "./Transmission";
import { ExecutionContext } from "./ExecutionContext";

export class Script {
  #ctx: ExecutionContext;

  constructor(context?: ExecutionContext) {
    this.#ctx = new ExecutionContext({ parent: context });
  }

  send(
    receiver: Recipient,
    message: Message,
    options: TransmissionOptions = {}
  ) {
    this.#ctx.addTransmission(new Transmission(receiver, message, options));
    return this;
  }

  child() {
    return new Script(this.#ctx);
  }

  bind(transmission: Transmission) {
    return (..._: unknown[]) => {
      this.execute();
    };
  }

  execute() {
    this.#ctx.execute();
  }
}
