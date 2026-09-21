import { Named } from "./Named";
import { Nil } from "./Nil";

export class Class implements Named {
  #name: string;
  #namespace: string | Nil;
  #methods: Record<string, unknown>;

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

  defineMethod(name: string, method: unknown) {
    this.#methods[name] = method;
  }

  get methods(): Record<string, unknown> {
    return this.#methods;
  }

  methodNames(): string[] {
    return Object.keys(this.#methods);
  }

  hasMethod(name: string): boolean {
    return this.#methods[name] !== undefined;
  }

  method(name: string): unknown {
    const method = this.#methods[name];
    if (method !== undefined) return method;

    throw new Error(`unknown method ${name}`);
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
Class.prototype.method_1 = Class.prototype.method;

// @ts-ignore
Class.prototype.method_QEST_1 = Class.prototype.hasMethod;

// @ts-ignore
Class.prototype.method_DASH_names = Class.prototype.methodNames;
