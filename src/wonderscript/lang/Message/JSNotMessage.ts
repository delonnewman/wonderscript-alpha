import { UnaryMessage } from "./UnaryMessage";

export class JSNotMessage extends UnaryMessage {
  get name(): string {
    return '!';
  }
}