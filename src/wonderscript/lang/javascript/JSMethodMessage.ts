import { ArgListMessage } from "../Message/ArgListMessage";

export class JSMethodMessage extends ArgListMessage {
  get ident(): string {
    return this.name;
  }

  get interned() {
    return this.name;
  }
}
