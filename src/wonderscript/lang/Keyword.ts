import {Named} from "./Named";
import {Symbol} from "./Symbol";
import {Nil} from "./Nil";

export class Keyword implements Named {
    private readonly _symbol: Symbol;

    static CACHE = new WeakMap<Symbol, Keyword>();

    static init(name: string, namespace?: string): Keyword {
        const sym = new Symbol(name, namespace);
        if (!this.CACHE.has(sym)) {
            this.CACHE.set(sym, new this(sym));
        }

        return this.CACHE.get(sym);
    }

    constructor(symbol: Symbol) {
        this._symbol = symbol;
    }

    name(): string {
        return this._symbol.name();
    }

    namespace(): string | Nil {
        return this._symbol.namespace();
    }

    toString() {
        return `:${this._symbol}`
    }
}