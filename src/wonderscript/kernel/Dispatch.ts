import { Message } from "./Message";

export class Dispatch {
  readonly subject: Object;
  readonly message: Message;
  
  constructor(object: Object, message: Message) {
    this.subject = object;
    this.message = message;
  }

  execute() {
    let method = this.subject[this.message.toString()];
    if (method === undefined) {
      method = this.subject[this.message.name];
    }
    
    if (typeof method !== "function") {
      throw new Error(`Don't understand ${this.message}`);
    }

    method.apply(this.subject, this.message.args)
  }
}
