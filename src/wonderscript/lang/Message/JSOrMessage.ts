import { BinaryMessage } from "./BinaryMessage";

export class JSOrMessage extends BinaryMessage {
  get interned(): string {
    return "||";
  }
}