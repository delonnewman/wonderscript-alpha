import { ObjectPool } from "../ObjectPool";
import { Context } from "../Context";
import { Dispatch } from "../Dispatch";
import { Symbol } from "../Symbol";
import { Package } from "../Package";

export class Variable implements Dispatch {
  #symbol: Symbol;

  constructor(symbol: Symbol) {
    this.#symbol = symbol;
  }

  dispatch(_pool: ObjectPool, ctx: Context): unknown {
    if (this.#symbol.hasNamespace()) {
      const ns = Symbol.intern(this.#symbol.namespace);
      const pkg = ctx.lookup(ns)?.get(ns) as Package | undefined;
      if (pkg == null) {
        throw new Error(`undefined package ${ns}`);
      }

      return pkg.get(Symbol.intern(this.#symbol.name));
    }

    ctx = ctx.lookup(this.#symbol);
    if (ctx == null) {
      throw new Error(`undefined variable ${this.#symbol}`);
    }

    return ctx.get(this.#symbol);
  }
}