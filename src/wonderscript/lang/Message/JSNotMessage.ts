import { UnaryMessage } from "./UnaryMessage";

export class JSNotMessage extends UnaryMessage {
  get interned(): string {
    return '!';
  }
}