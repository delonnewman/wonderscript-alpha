import { Named, namespace, name } from "./Named";
import { Keyword } from "./Keyword";
import { Symbol } from "./Symbol";
import { Message } from "./Message";
import { JSMethodMessage } from "./javascript/JSMethodMessage";
import { ObjectPool, ObjectType } from "./Object";

export type MethodFn = (self: unknown, ...args: unknown[]) => unknown;
export type JSClass = Function & {
  $ws$Class?: Class;
};

export class Class implements Named, Message {
  #name: string;
  #namespace: string | undefined;
  #methods: Record<string, MethodFn> = {};
  #messages: Message[] = [];
  #subclasses: Class[] = [];

  static fromJS(constructor: JSClass) {
    if (constructor.$ws$Class) return constructor.$ws$Class;

    const klass = new this(constructor.name, "js");

    const table = constructor.prototype as Record<string, Function>;
    const methods = Object.getOwnPropertyNames(constructor.prototype);
    for (const method of methods) {
      klass.defineMethod(
        new JSMethodMessage(method, 'js'),
        (self, ...args) => table[method].apply(self, args)
      );
    }

    constructor.$ws$Class = klass;

    return klass;
  }

  constructor(name: string, namespace: string | null | undefined) {
    this.#name = name;
    this.#namespace = namespace;
  }

  allocate() {
    return ObjectPool.allocate(this, ObjectType.REF);
  }

  get name() {
    return this.#name;
  }

  get namespace() {
    return this.#namespace;
  }

  get interned() {
    if (this.#namespace == null) {
      return this.#name;
    }

    return `${this.#namespace}$${this.#name}`;
  }

  defineMethod(msg: Message, method: MethodFn) {
    this.#messages.push(msg);
    this.#methods[msg.interned] = method;
  }

  hasMethod(name: string): boolean {
    return this.#methods[name] !== undefined;
  }

  findMethod(msg: Message) {
    const method = this.#methods[msg.interned];
    if (method !== undefined) return method;

    throw new Error(`unknown method ${msg}`);
  }

  send(value: unknown, msg: Message) {
    const method = this.findMethod(msg);
    return method(value);
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
