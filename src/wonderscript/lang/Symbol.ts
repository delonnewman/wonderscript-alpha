import {Named} from "./Named";
import {Meta, MetaData} from "./Meta";
import {Nil} from "./Nil";
import {Invokable} from "./Invokable";
import {merge} from "./runtime";

const SLASH = '/';

export class Symbol implements Named, Meta, Invokable, Comparable, Equality {
    private readonly _name: string;
    private readonly _namespace?: string;
    private readonly _meta?: MetaData;

    static CACHE = new Map<String, Symbol>();

    static parse(str: string): Symbol {
        if (str === SLASH) return this.intern(SLASH);

        const [ns, name] = str.split(SLASH);
        if (name == null) {
            return this.intern(ns);
        }

        return this.intern(name, ns);
    }

    static intern(name: string, namespace?: string, meta?: MetaData): Symbol {
        return new this(name, namespace, meta);
    }

    constructor(name: string, namespace?: string, meta?: MetaData) {
        this._name = name;
        this._namespace = namespace;
        this._meta = meta;
        Object.freeze(this);
    }

    meta(): MetaData {
        return this._meta;
    }

    withMeta(data: MetaData): Meta {
        return new Symbol(this._name, this._namespace, merge(this._meta, data));
    }

    hasMeta(): boolean {
        return this._meta != null;
    }

    name(): string {
        return this._name;
    }

    namespace(): string | Nil {
        return this._namespace;
    }

    hasNamespace(): boolean {
        return this._namespace != null;
    }

    cmp(other: Symbol): -1 | 1 | 0 {
        if (!isSymbol(other)) throw new Error("cannot compare symbols to other values");

        const a = this.toString();
        const b = other.toString();

        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }

    equals(other: Symbol): boolean {
        if (!isSymbol(other)) return false

        return this._name === other.name() && this._namespace === other.namespace()
    }

    invoke(map: Map<Symbol, any>): any {
        if (map == null) return null;

        return map.get(this);
    }

    toString() {
        if (this._namespace) {
            return `${this._namespace}/${this._name}`;
        }

        return this._name;
    }
}

export const isSymbol = (value: unknown): value is Symbol =>
    value instanceof Symbol