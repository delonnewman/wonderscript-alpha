import { Message } from "./Message";
import { Recipient } from "./Dispatch";
import { Transmission, TransmissionOptions } from "./Transmission";
import { ExecutionContext } from "./ExecutionContext";

export class Script {
  #ctx: ExecutionContext;
  #bindings: Map<string, unknown>;

  constructor(context?: ExecutionContext) {
    this.#ctx = new ExecutionContext({ parent: context });
    this.#bindings = new Map();
  }

  send(
    receiver: Recipient,
    message: Message,
    options: TransmissionOptions = {}
  ) {
    this.#ctx.addTransmission(new Transmission(receiver, message, options));
    return this;
  }

  set(name: string, value: unknown) {
    this.#bindings.set(name, value);
    return value;
  }

  get(name: string) {
    return this.#bindings.get(name);
  }

  child() {
    return new Script(this.#ctx);
  }

  bind(transmission: Transmission) {
    this.set("message", transmission.message);
    this.set("receiver", transmission.reciever);

    if (transmission.sender) {
      this.set("sender", transmission.sender);
    }

    return (..._: unknown[]) => {
      this.execute();
    };
  }

  execute() {
    this.#ctx.execute();
  }
}
