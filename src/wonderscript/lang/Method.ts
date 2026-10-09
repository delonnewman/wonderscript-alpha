import { Message } from "./Message";
import { Dispatch } from "./Dispatch";

export class Method {
  readonly message: Message;
  readonly dispatch: Dispatch;

  constructor(message: Message, dispatch: Dispatch) {
    this.message = message;
    this.dispatch = dispatch;
  }
}