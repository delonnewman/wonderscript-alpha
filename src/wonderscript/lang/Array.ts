import { hashCode, hashCombine } from "./utils";
import { Hashable } from "./Value";
import { Message } from "./Message";
import { Binding } from "./Dispatch/Binding";
import { Symbol } from "./Symbol";

const HASH_SEED = 12294658982929121;

export class Array extends globalThis.Array implements Hashable, Message {
  static inspect() {
    return this.name;
  }

  hashCode() {
    let n = HASH_SEED;
    for (let entry of this) {
      n = hashCombine(n, hashCode(entry));
    }
    return n;
  }

  get interned(): string {
    return `array_${this.length}`;
  }

  bindings(msg: Message): readonly Binding[] {
    if (!(msg instanceof Array)) {
      throw new Error(`invalid message for bindings: ${msg}`);
    }

    const bindings = [];

    const names: Symbol[] = this.filter((it) => it instanceof Symbol);
    for (let i = 0; i < names.length; i++) {
      bindings.push(new Binding(names[i], msg[i]));
    }

    return bindings;
  }

  get internings(): string[] {
    return [this.interned, `${this.interned}_splat`];
  }

  inspect() {
    if (this.length === 0) {
      return "()";
    }

    const parts = this.map((x: unknown) => x.toString());
    return `(${parts.join(" ")})`;
  }

  toString() {
    return this.inspect();
  }
}