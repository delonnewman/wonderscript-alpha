import { Message } from "./Message";
import { Recipient } from "./Dispatch";
import { Transmission, TransmissionOptions } from "./Transmission";

export class Script {
  #transmissions: Transmission[];

  constructor() {
    this.#transmissions = [];
  }

  get transmissions() {
    return this.#transmissions;
  }

  send(
    receiver: Recipient,
    message: Message,
    options: TransmissionOptions = {}
  ) {
    this.#transmissions.push(new Transmission(receiver, message, options));
    return this;
  }

  bind(transmission: Transmission) {
    return (..._: unknown[]) => {
      this.execute();
    };
  }

  execute() {
    for (const transmission of this.#transmissions) {
      transmission.execute();
    }
  }
}
