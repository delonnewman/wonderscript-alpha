import { Named } from "./Named";
import { Meta, MetaData } from "./Meta";
import { Nil } from "./Nil";
import { Invokable } from "./Invokable";
import { Comparable, Order } from "./Comparable";
import { merge } from "./merge";
import { Value } from "./Value";
import { stringHash } from "./utils";

const SLASH = "/";

export class Symbol<Name = string>
  implements Named<Name>, Meta, Invokable, Comparable, Value
{
  readonly #name: Name;
  readonly #namespace?: string;
  readonly #meta?: MetaData;

  static CACHE = new Map<String, Symbol>();

  static parse(str: string): Symbol {
    if (str === SLASH) return this.intern(SLASH);

    const [ns, name] = str.split(SLASH);
    if (name == null) {
      return this.intern(ns);
    }

    return this.intern(name, ns);
  }

  static intern<Name = string>(
    name: Name,
    namespace?: string,
    meta?: MetaData
  ): Symbol<Name> {
    return new this<Name>(name, namespace, meta);
  }

  constructor(name: Name, namespace?: string, meta?: MetaData) {
    this.#name = name;
    this.#namespace = namespace;
    this.#meta = meta;
    Object.freeze(this);
  }

  meta(): MetaData {
    return this.#meta;
  }

  withMeta(data: MetaData): Symbol<Name> {
    return new Symbol<Name>(
      this.#name,
      this.#namespace,
      merge(this.#meta, data)
    );
  }

  withoutMeta(): Symbol<Name> {
    return this.withMeta(null);
  }

  hasMeta(): boolean {
    return this.#meta != null;
  }

  name(): Name {
    return this.#name;
  }

  namespace(): string | Nil {
    return this.#namespace;
  }

  hasNamespace(): boolean {
    return this.#namespace != null;
  }

  cmp(other: Symbol): Order {
    if (!isSymbol(other))
      throw new Error("cannot compare symbols to other values");

    const a = this.toString();
    const b = other.toString();

    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  equals(other: any): boolean {
    if (!isSymbol(other)) return false;

    return this.#name === other.name() && this.#namespace === other.namespace();
  }

  hashCode(): number {
    return stringHash(`'${this.toString()}`);
  }

  invoke(args: Map<Symbol<Name>, unknown>[]): unknown {
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

export const isSymbol = (value: unknown): value is Symbol =>
  value instanceof Symbol;
