import { Named, namespace, name } from "./Named";
import { Nil } from "./Nil";
import { Keyword } from "./Keyword";
import { Symbol } from "./Symbol";
import { Message } from "./Message";

export class Class implements Named {
  #name: string;
  #namespace: string | Nil;
  #methods: Record<string, unknown>;
  #messages: Message[];
  #subclasses: Class[];

  constructor(name: string, namespace: string | Nil) {
    this.#name = name;
    this.#namespace = namespace;
  }

  get name(): string {
    return this.#name;
  }

  get namespace(): string | Nil {
    return this.#namespace;
  }

  hasNamespace(): boolean {
    return this.#namespace != null;
  }

  defineMethod(msg: Message, method: unknown) {
    this.#messages.push(msg);
    this.#methods[msg.interned] = method;
  }

  hasMethod(name: string): boolean {
    return this.#methods[name] !== undefined;
  }

  findMethod(name: string): unknown {
    const method = this.#methods[name];
    if (method !== undefined) return method;

    throw new Error(`unknown method ${name}`);
  }

  get subclasses() {
    return Array.from(this.#subclasses);
  }

  subclass(subclassName: string | Keyword | Symbol) {
    const ns = namespace(subclassName);
    const nm = name(subclassName);

    const subclass = new Class(nm, ns);
    this.#subclasses.push(subclass);

    return subclass;
  }

  get messages(): Message[] {
    return Array.from(this.#messages);
  }
}

// Interned method aliases

// @ts-ignore
Class.prototype.name_0 = Class.prototype.name;

// @ts-ignore
Class.prototype.namespace_0 = Class.prototype.namespace;

// @ts-ignore
Class.prototype.namespace_QEST_0 = Class.prototype.hasNamespace;

// @ts-ignore
Class.prototype.define_DASH_method_2 = Class.prototype.defineMethod;

// @ts-ignore
Class.prototype.find_DASH_method_1 = Class.prototype.findMethod;

// @ts-ignore
Class.prototype.method_QEST_1 = Class.prototype.hasMethod;

// @ts-ignore
Class.prototype.messages_0 = Class.prototype.messages;

// @ts-ignore
Class.prototype.subclasses_0 = Class.prototype.subclasses;

// @ts-ignore
Class.prototype.subclass_1 = Class.prototype.subclass;
