import { BinaryMessage } from "../Message/BinaryMessage";

export class JSOrMessage extends BinaryMessage {
  get interned(): string {
    return "||";
  }
}