import { BaseMessage } from "../Message/BaseMessage";

export class JSMethodMessage extends BaseMessage {
  get ident(): string {
    return this.name;
  }
}
