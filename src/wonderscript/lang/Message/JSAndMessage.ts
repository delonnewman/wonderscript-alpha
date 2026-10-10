import { BinaryMessage } from "./BinaryMessage";

export class JSAndMessage extends BinaryMessage {
  get interned(): string {
    return '&&';
  }
}