import { Message } from "./Message";

export class Set extends globalThis.Set implements Message {
  get interned() {
    return `Set_${this.size}`;
  }
}