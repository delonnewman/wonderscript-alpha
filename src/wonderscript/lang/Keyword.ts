import {Named, namedHash} from "./Named";
import {Symbol} from "./Symbol";
import {Nil} from "./Nil";
import {Invokable} from "./Invokable";

export class Keyword implements Named, Invokable {
    private readonly _symbol: Symbol;

    static CACHE = new Map<string, Keyword>();

    static parse(str: string): Keyword {
        const [ns, name] = str.slice(1).split('/');

        if (name == null) {
            return this.intern(ns);
        }

        return this.intern(name, ns);
    }

    static intern(name: string, namespace?: string): Keyword {
        const s = namedHash(name, namespace);
        if (!this.CACHE.has(s)) {
            this.CACHE.set(s, new this(new Symbol(name, namespace)));
        }

        return this.CACHE.get(s);
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

    hasNamespace(): boolean {
        return this._symbol.hasNamespace();
    }

    invoke(map: Map<Keyword, any>): any {
        return map.get(this);
    }

    toString() {
        return `:${this._symbol}`
    }

    toJS(): string {
        return `wonderscript.core.keyword(${JSON.stringify(this.name())}, ${JSON.stringify(this.namespace())})`
    }
}

export const isKeyword = (value: unknown): value is Keyword =>
    value instanceof Keyword