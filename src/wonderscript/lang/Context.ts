import {isUndefined} from "./runtime";
import {Nil} from "./Nil";
import {Symbol} from "./Symbol";
import {MetaData} from "./Meta";
import {Keyword} from "./Keyword";

const MUTABLE_KW = Keyword.intern("mutable");

export class Context {
    private readonly vars: Map<string, any>;
    private readonly varMeta: Map<string, MetaData>;
    private readonly parent: Context | null;
    private _isRecursive: boolean

    constructor(parent?: Context) {
        this.parent = parent;
        this.vars = new Map<string, any>();
        this.varMeta = new Map<string, MetaData>();
        this._isRecursive = false;
    }

    setRecursive(): Context {
        this._isRecursive = true;

        return this;
    }

    isRecursive(): boolean {
        return this._isRecursive;
    }

    get(sym: Symbol): any | Nil {
        return this.vars.get(sym.name());
    }

    has(sym: Symbol): boolean {
        return this.vars.has(sym.name());
    }

    isMutable(sym: Symbol): boolean {
        if (!this.varHasMeta(sym)) {
            return false;
        }

        return this.varMeta.get(sym.name())?.get(MUTABLE_KW) === true;
    }

    varHasMeta(sym: Symbol): boolean {
        return this.varMeta.has(sym.name());
    }

    lookup(name: Symbol): Context | Nil {
        if (this.has(name)) {
            return this;
        }

        if (this.parent == null) return null;

        let scope = this.parent;
        while (scope != null) {
            if (scope.has(name)) {
                return scope;
            }
            scope = scope.parent;
        }
        return null;
    }

    set(sym: Symbol, value: unknown): Context {
        if (!this.has(sym)) {
            throw new Error(`undefined variable: ${sym}`);
        }

        if (!this.isMutable(sym)) {
            throw new Error(`cannot mutate an immutable value: ${sym}`);
        }

        this.vars.set(sym.name(), value);

        return this;
    }

    // TODO: deal with meta data options here
    define(sym: Symbol, value?: unknown): Context {
        if (!isUndefined(value)) {
            this.vars.set(sym.name(), value);
        }
        else {
            this.vars.set(sym.name(), null);
        }

        if (sym.hasMeta()) {
            this.varMeta.set(sym.name(), sym.meta());
        }

        return this;
    }

    toString() {
        const buffer = ['#<Context'];

        if (this.vars.size !== 0) {
            buffer.push(' variables: ', Array.from(this.vars.keys()).join(', '));
        }

        if (this.parent) {
            buffer.push(' parent: ', this.parent.toString());
        }

        buffer.push('>');

        return buffer.join('');
    };
}

export function isContext(x): x is Context {
    return x instanceof Context;
}