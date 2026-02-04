import { Message } from "./Message";
import { Transmission } from "./Transmission";

export interface Method {
  bind(transmission: Transmission): Function;
}

export interface Recipient {
  dispatch: Dispatch;
}

export abstract class Dispatch {
  abstract lookup(msg: Message): Method;
  abstract add(msg: Message, script: Method): Dispatch;
}
