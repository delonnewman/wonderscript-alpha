import { Message } from "./Message";

export interface Method {
  bind(subject: Recipient): Function;
}

export interface Recipient {
  dispatch: Dispatch;
}

export abstract class Dispatch {
  abstract lookup(msg: Message): Method;
  abstract add(msg: Message, script: Method): Dispatch;
}
