import { BaseMessage } from "./BaseMessage";
import { UnaryMessage } from "./UnaryMessage";

export class JSPrimitiveMessage extends BaseMessage {
}

export class JSTypeMessage extends UnaryMessage {
  sendTo(obj: Record<string, unknown>): unknown {
    return typeof obj;
  }

  toJS(): string {
    return "string";
  }
}