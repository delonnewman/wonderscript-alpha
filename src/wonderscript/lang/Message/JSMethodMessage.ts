import { BaseMessage } from "./BaseMessage";

export class JSMethodMessage extends BaseMessage {
  get ident(): string {
    return this.name;
  }
}
