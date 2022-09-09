import {isUndefined} from "./runtime";
import {Object} from "./Object";
import {Nil} from "./Nil";

export class Context {
    private readonly vars: Map<string, any>;
    private readonly parent: Context | null;
    private _isRecursive: boolean

    constructor(parent?: Context) {
        this.parent = parent;
        this.vars = new Map<string, any>();
        this._isRecursive = false;
    }

    setRecursive(): Context {
        this._isRecursive = true;

        return this;
    }

    isRecursive(): boolean {
        return this._isRecursive;
    }

    get(name: string): any | Nil {
        return this.vars.get(name);
    }

    has(name: string): boolean {
        return this.vars.has(name);
    }

    lookup(name: string): Context | Nil {
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

    set(name: string, value: unknown): Context {
        this.vars.set(name, value);

        return this;
    }

    define(name: string, value?: unknown): Context {
        if (!isUndefined(value)) {
            this.set(name, value);
        }
        else {
            this.set(name, null);
        }

        return this;
    }

    toString() {
        const buffer = ['#<Context variables: ', Object.keys(this.vars).join(', ')];
        if (this.parent) {
            buffer.push('parent: ', this.parent.toString());
        }
        buffer.push('>');
        return buffer.join('');
    };
}

export function isContext(x): x is Context {
    return x instanceof Context;
}