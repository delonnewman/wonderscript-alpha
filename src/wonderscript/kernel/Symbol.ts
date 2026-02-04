import { Dispatch, Recipient } from "./Dispatch";
import { Message } from "./Message";
import { Script } from "./Script";

export class Symbol implements Recipient {
  readonly name: string;
  readonly namespace?: string;
  readonly dispatch: Dispatch;

  static intern(value: string) {
    const [x, y] = value.split("$");

    let name: string, ns: string | undefined;
    if (y) {
      ns = x;
      name = y;
    } else {
      name = x;
    }

    return new this(name, ns);
  }

  constructor(name: string, namespace?: string) {
    this.name = name;
    this.namespace ??= namespace;
    this.dispatch = new NativeDispatch();
  }

  toString() {
    if (!this.namespace) {
      return this.name;
    }
    return `${this.namespace}$${this.name}`;
  }
}

export class NativeDispatch extends Dispatch {
  #methods: Map<string, Script>;

  constructor() {
    super();
    this.#methods = new Map();
  }

  lookup(msg: Message): Script {
    let script = this.#methods.get(msg.toString());
    if (script === undefined) {
      throw new Error(`Don't understand ${msg}`);
    }

    return script;
  }

  add(msg: Message, script: Script) {
    this.#methods.set(msg.toString(), script);
    return this;
  }
}
