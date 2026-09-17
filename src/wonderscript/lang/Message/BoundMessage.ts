import { Envelope, Message, Obj } from "../Message";

export class BoundMessage implements Envelope {
  #msg: Message;
  #obj: Obj;

  constructor(msg: Message, obj: Obj) {
    this.#msg = msg;
    this.#obj = obj;
  }

  sendTo(_: Obj) {
    return this.#msg.sendTo(this.#obj);
  }
}
