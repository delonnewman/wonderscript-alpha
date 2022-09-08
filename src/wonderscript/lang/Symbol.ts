import {Named} from "./Named";
import {Meta, MetaData} from "./Meta";
import {Nil} from "./Nil";
import {Keyword} from "./Keyword";
import {Invokable} from "./Invokable";

const SLASH = '/';

export class Symbol<Name = string, Namespace = string> implements Named<Name, Namespace>, Meta, Invokable {
    private readonly _name: Name;
    private readonly _namespace?: Namespace;
    private _meta?: MetaData;

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
        return new this(name, namespace);
    }

    constructor(name: Name, namespace?: Namespace, meta?: MetaData) {
        this._name = name;
        this._namespace = namespace;
        this._meta = meta
    }

    meta(): MetaData {
        return this._meta;
    }

    withMeta(data: MetaData): Meta {
        return new Symbol(this._name, this._namespace, data);
    }

    setMeta(key: Keyword, value: any): Symbol<Name, Namespace> {
        if (this._meta == null) {
            this._meta = new Map();
        }

        this._meta.set(key, value)

        return this;
    }

    resetMeta(data: Map<Keyword, any>): Symbol<Name, Namespace> {
        this._meta = data;

        return this;
    }

    hasMeta(): boolean {
        return this._meta != null;
    }

    name(): Name {
        return this._name;
    }

    namespace(): Namespace | Nil {
        return this._namespace;
    }

    hasNamespace(): boolean {
        return this._namespace != null;
    }

    equals(other: Symbol): boolean {
        if (!isSymbol(other)) return false

        return this._name === other.name() && this._namespace === other.namespace()
    }

    invoke(map: Map<Symbol<Name, Namespace>, any>): any {
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