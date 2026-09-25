import { Named, namespace, name } from "./Named";
import { Keyword } from "./Keyword";
import { Symbol } from "./Symbol";
import { Message } from "./Message";
import { ObjectPool, ObjectType, ObjectValue } from "./Object";
import { ArgListMessage } from "./Message/ArgListMessage";

export type MethodFn = (self: unknown, ...args: unknown[]) => unknown;

export type JSClass = {
  $ws$Class?: Class;
};

export type JSConstructor = Function & JSClass;
export type JSSingleton = Object & JSClass;

export class Class implements Named, Message {
  #name: string;
  #namespace: string | undefined;
  #methods: Record<string, MethodFn> = {};
  #messages: Message[] = [];
  #subclasses: Class[] = [];

  static fromJSConstructor(constructor: JSConstructor, namespace = 'js') {
    if (constructor.$ws$Class) return constructor.$ws$Class;

    const klass = this.create(constructor.name, namespace);

    const table = constructor.prototype as Record<string, Function>;
    const methods = Object.getOwnPropertyNames(constructor.prototype);
    for (const method of methods) {
      klass.defineMethod(
        new ArgListMessage(method, klass.namespace),
        (self, ...args) => table[method].apply(self, args)
      );
    }

    constructor.$ws$Class = klass;

    return klass;
  }

  static fromJSSingleton(object: JSSingleton, name: string, namespace = 'js') {
    if (object.$ws$Class) return object.$ws$Class;

    const klass = this.create(name, namespace);

    const table = object as Record<string, Function>;
    const methods = Object.getOwnPropertyNames(object);
    for (const method of methods) {
      klass.defineMethod(
        new ArgListMessage(method, klass.namespace),
        (self, ...args) => table[method].apply(self, args)
      );
    }

    object.$ws$Class = klass;

    return klass;
  }

  static create(name: string, namespace?: string) {
    const obj = ObjectPool.allocate(ClassClass);
    return new this(obj, name, namespace);
  }

  constructor(object: ObjectValue, name: string, namespace: string | null | undefined) {
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

    const subclass = Class.create(nm, ns);
    this.#subclasses.push(subclass);

    return subclass;
  }

  get messages(): Message[] {
    return Array.from(this.#messages);
  }
}
