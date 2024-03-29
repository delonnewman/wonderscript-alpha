import {Named} from "./Named";
import {Meta, MetaData} from "./Meta";
import {Nil} from "./Nil";
import {Invokable} from "./Invokable";
import {merge} from "./runtime";
import {Value} from "./Value";
import {stringHash} from "./utils";

const SLASH = '/';

export class Symbol<Name = string> implements Named<Name>, Meta, Invokable, Comparable, Value {
    private readonly _name: Name;
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

    static intern<Name = string>(name: Name, namespace?: string, meta?: MetaData): Symbol<Name> {
        return new this<Name>(name, namespace, meta);
    }

    constructor(name: Name, namespace?: string, meta?: MetaData) {
        this._name = name;
        this._namespace = namespace;
        this._meta = meta;
        Object.freeze(this);
    }

    meta(): MetaData {
        return this._meta;
    }

    withMeta(data: MetaData): Symbol<Name> {
        return new Symbol<Name>(this._name, this._namespace, merge(this._meta, data));
    }

    withoutMeta(): Symbol<Name> {
        return this.withMeta(null);
    }

    hasMeta(): boolean {
        return this._meta != null;
    }

    name(): Name {
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

    equals(other: any): boolean {
        if (!isSymbol(other)) return false

        return this._name === other.name() && this._namespace === other.namespace()
    }

    hashCode(): number {
        return stringHash(`'${this.toString()}`);
    }

    invoke(args: Map<Symbol<Name>, any>[]): any {
        if (args.length === 0) return null;

        if (args.length === 1) {
            const map = args[0];
            return map.get(this);
        }

        return args.map((m) => m.get(this));
    }

    toString() {
        if (this._namespace) {
            return `${this._namespace}/${this._name}`;
        }

        return `${this._name}`;
    }
}

export const isSymbol = (value: unknown): value is Symbol =>
    value instanceof Symbol