import { BinaryMessage } from "../Message/BinaryMessage";

export class JSAndMessage extends BinaryMessage {
  get interned(): string {
    return '&&';
  }
}