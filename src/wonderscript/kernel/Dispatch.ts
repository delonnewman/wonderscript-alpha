
import { Message } from "./Message";

export interface Recipient {
  dispatch: Dispatch;
}

export abstract class Dispatch {
  abstract lookup(msg: Message): Function;
  abstract addMethod(msg: Message, method: Function);
}
