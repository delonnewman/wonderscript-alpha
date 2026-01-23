import { Dispatch } from "./Dispatch";
import { Message } from "./Message";

export class Script {
  #dispatches: Dispatch[];

  constructor() {
    this.#dispatches = [];
  }

  get dispatches () {
    return Object.freeze(this.#dispatches.slice(0));
  }

  send(subject: Object, message: Message) {
    this.#dispatches.push(new Dispatch(subject, message));
    return this;
  }

  execute() {
    for (const dispatch of this.#dispatches) {
      dispatch.execute()
    }
  }
}
