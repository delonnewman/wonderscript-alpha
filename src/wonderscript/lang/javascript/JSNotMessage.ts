import { UnaryMessage } from "../Message/UnaryMessage";

export class JSNotMessage extends UnaryMessage {
  get interned(): string {
    return '!';
  }
}