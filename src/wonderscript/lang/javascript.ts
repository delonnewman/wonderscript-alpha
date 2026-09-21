import { BaseMessage } from "./Message/BaseMessage";
import { UnaryMessage } from "./Message/UnaryMessage";

export class JSTypeMessage extends UnaryMessage {
  sendTo(obj: Record<string, unknown>): unknown {
    return typeof obj;
  }

  toJS(): string {
    return "string";
  }
}