import { Named, NullableString } from "./Named";
import { Meta, MetaData } from "./Meta";
import { Invokable } from "./Invokable";
import { Comparable, Order } from "./Comparable";
import { merge } from "./merge";
import { Value } from "./Value";
import { stringHash } from "./utils";
import { Message } from "./Message";
import { Binding } from "./Dispatch/Binding";

const SLASH = "/";
const EMPTY_ARRAY = Object.freeze([]);

export class Symbol<Name extends string = string, Namespace extends NullableString = NullableString>
  implements Named<Name, Namespace>, Meta, Invokable, Comparable, Value, Message
{
  readonly #name: Name;
  readonly #namespace: Namespace;
  readonly #meta?: MetaData;

  static CACHE = new Map<string, Symbol>();

  static parse(str: string): Symbol {
    if (str === SLASH) return this.intern(SLASH);

    const [ns, name] = str.split(SLASH);
    if (name == null) {
      return this.intern(ns);
    }

    return this.intern(name, ns);
  }

  static intern<Name extends string = string, Namespace extends NullableString = NullableString>(
    name: Name,
    namespace?: Namespace,
  ): Symbol<Name, Namespace> {
    const key = namespace ? `${namespace}/${name}` : name;

    if (this.CACHE.has(key)) {
      return this.CACHE.get(key) as Symbol<Name, Namespace>;
    }

    const sym = new this<Name, Namespace>(name, namespace);
    this.CACHE.set(key, sym);

    return sym;
  }

  constructor(name: Name, namespace?: Namespace, meta?: MetaData) {
    this.#name = name;
    this.#namespace = namespace;
    this.#meta = meta;
    Object.freeze(this);
  }

  meta(): MetaData {
    return this.#meta;
  }

  withMeta(data: MetaData): Symbol<Name, Namespace> {
    return new Symbol<Name, Namespace>(
      this.#name,
      this.#namespace,
      merge(this.#meta, data)
    );
  }

  withoutMeta(): Symbol<Name, Namespace> {
    return this.withMeta(null);
  }

  hasMeta(): boolean {
    return this.#meta != null;
  }

  get interned() {
    if (this.#namespace) {
      return `${this.#namespace}_${this.#name}`;
    }

    return `${this.#name}`;
  }

  get internings(): string[] {
    return [this.interned];
  }

  bindings(_: Message): readonly Binding[] {
    return EMPTY_ARRAY;
  }

  get name(): Name {
    return this.#name;
  }

  get namespace(): Namespace {
    return this.#namespace;
  }

  hasNamespace(): boolean {
    return this.#namespace != null;
  }

  cmp(other: Symbol<Name, Namespace>): Order {
    if (!(other instanceof Symbol))
      throw new Error("cannot compare symbols to other values");

    const a = this.toString();
    const b = other.toString();

    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  equals(other: any): boolean {
    if (!(other instanceof Symbol)) return false;

    return this.#name === other.name && this.#namespace === other.namespace;
  }

  hashCode(): number {
    return stringHash(`'${this.toString()}`);
  }

  invoke(...args: Map<Symbol<Name, Namespace>, unknown>[]): unknown {
    if (args.length === 0) return null;

    if (args.length === 1) {
      const map = args[0];
      return map.get(this);
    }

    return args.map((m) => m.get(this));
  }

  toString() {
    if (this.#namespace) {
      return `${this.#namespace}/${this.#name}`;
    }

    return `${this.#name}`;
  }
}
