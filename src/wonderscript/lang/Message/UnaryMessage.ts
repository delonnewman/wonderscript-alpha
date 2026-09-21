import { BaseMessage } from "./BaseMessage";

export class UnaryMessage extends BaseMessage {
  get arity(): number {
    return 0;
  }
}