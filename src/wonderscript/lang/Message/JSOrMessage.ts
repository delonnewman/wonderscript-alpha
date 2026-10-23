import { BinaryMessage } from "./BinaryMessage";

export class JSOrMessage extends BinaryMessage {
  get name(): string {
    return "||";
  }
}