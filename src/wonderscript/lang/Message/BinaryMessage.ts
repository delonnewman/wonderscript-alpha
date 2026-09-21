import { BaseMessage } from "./BaseMessage";

export class BinaryMessage extends BaseMessage {
  get arity(): number {
    return 1;
  }
}