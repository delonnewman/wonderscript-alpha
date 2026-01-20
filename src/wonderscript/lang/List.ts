import { Meta, MetaData } from "./Meta";
import { Nil } from "./Nil";
import { First, isSequence, Next, Sequence } from "./Seq";
import { Sequenceable } from "./Sequenceable";
import { merge, reduce } from "./runtime";
import { Value } from "./Value";
import { hashCode, hashCombine } from "./utils";

const HASH_SEED: number = 4221954417;

export class List implements Meta, Sequence, Sequenceable, Value {
  static EMPTY = new this(null, null);

  readonly #first: First;
  readonly #next: List | Nil;
  readonly #count: number;
  readonly #meta: MetaData | Nil;
  #hashCode: number | null;

  constructor(first: First, next: List | Nil, count = 0, meta?: MetaData) {
    this.#first = first;
    this.#next = next;
    this.#count = count;
    this.#meta = meta;
    this.#hashCode = null;
  }

  empty(): List {
    return List.EMPTY;
  }

  isEmpty(): boolean {
    return this.count() === 0;
  }

  cons(val: unknown): List {
    if (this.isEmpty()) {
      return new List(val, null, 1);
    }
    return new List(val, this, this.#count + 1);
  }

  seq(): List {
    return this;
  }

  meta(): MetaData | Nil {
    return this.#meta;
  }

  withMeta(data: MetaData): List {
    return new List(
      this.#first,
      this.#next,
      this.#count,
      merge(this.#meta, data)
    );
  }

  hasMeta(): boolean {
    return this.#meta != null;
  }

  first(): First {
    return this.#first;
  }

  next(): List | Nil {
    return this.#next;
  }

  count(): number {
    return this.#count;
  }

  equals(other: List): boolean {
    if (!isSequence(other)) return false;
    // TODO: generalize to isCounted add counted interface
    if (other instanceof List && this.count() !== other.count()) {
      return false;
    }

    let x = this.first();
    let xs: List = this;
    let y = other.first();
    let ys = other;

    while (xs != null && ys != null) {
      if (x !== y) return false; // TODO: toplevel equals needs to be accessible here
      x = xs.first();
      y = ys.first();
      xs = xs.next();
      ys = ys.next();
    }

    return xs == null && ys == null;
  }

  hashCode(): number {
    if (this.#hashCode == null) {
      this.#hashCode = reduce<number>(
        (n: number, x: Value) => hashCombine(n, hashCode(x)),
        this,
        HASH_SEED
      );
    }

    return this.#hashCode;
  }
}

export const isList = (value: unknown): value is List => value instanceof List;
