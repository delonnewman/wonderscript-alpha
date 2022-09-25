import {Named, namedHash} from "./Named";
import {Symbol} from "./Symbol";
import {Nil} from "./Nil";
import {Invokable} from "./Invokable";

export class Keyword<Name extends string = string> implements Named<Name>, Invokable, Comparable, Equality {
    private readonly _symbol: Symbol<Name>;

    static CACHE = new Map<string, Keyword<any>>();

    static parse(str: string): Keyword {
        const [ns, name] = str.slice(1).split('/');

        if (name == null) {
            return this.intern(ns);
        }

        return this.intern(name, ns);
    }

    static intern<Name extends string = string>(name: Name, namespace?: string): Keyword {
        const s = namedHash(name, namespace);
        if (!this.CACHE.has(s)) {
            this.CACHE.set(s, new this<Name>(new Symbol<Name>(name, namespace)));
        }

        return this.CACHE.get(s);
    }

    constructor(symbol: Symbol<Name>) {
        this._symbol = symbol;
        Object.freeze(this);
    }

    symbol(): Symbol<Name> {
        return this._symbol;
    }

    name(): Name {
        return this._symbol.name();
    }

    namespace(): string | Nil {
        return this._symbol.namespace();
    }

    hasNamespace(): boolean {
        return this._symbol.hasNamespace();
    }

    invoke(args: Map<Keyword<Name>, unknown>[]): unknown {
        if (args.length === 0) return null;

        if (args.length === 1) {
            const map = args[0];
            return map.get(this);
        }

        return args.map((m) => m.get(this));
    }

    cmp(other: unknown): -1 | 1 | 0 {
        if (!isKeyword(other)) throw new Error("cannot compare keywords to other values");

        return this._symbol.cmp(other.symbol());
    }

    equals(other: unknown): boolean {
        if (!isKeyword(other)) return false

        return this._symbol.equals(other.symbol());
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