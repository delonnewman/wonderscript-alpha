import { BinaryMessage } from "./BinaryMessage";

export class JSAndMessage extends BinaryMessage {
  get name(): string {
    return '&&';
  }
}