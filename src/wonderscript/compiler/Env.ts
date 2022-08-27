import {isUndefined} from "../lang/runtime";

export class Env {
    readonly vars: object;
    readonly parent: Env | null;
    private _isRecursive: boolean

    constructor(vars, parent) {
        this.vars = vars || {};
        this.parent = parent || null;
        this._isRecursive = false;
    }

    setRecursive(): Env {
        this._isRecursive = true;
        return this;
    }

    isRecursive(): boolean {
        return this._isRecursive;
    }

    toString() {
        const buffer = ['#<Env vars: ', Object.keys(this.vars).join(', ')];
        if (this.parent) {
            buffer.push('parent: ', this.parent.toString());
        }
        buffer.push('>');
        return buffer.join('');
    };
}

export function isEnv(x): x is Env {
    return x instanceof Env;
}

export function env(parent?: Env): Env {
    return new Env(null, parent);
}

export function lookup(env: Env, name: string) {
    if (env == null) {
        return null;
    }
    else if (env.vars != null && env.vars[name] != null) {
        return env;
    }
    else {
        if (env.parent == null) {
            return null;
        }
        else {
            var scope = env.parent;
            while (scope != null) {
                if (scope.vars != null && scope.vars[name] != null) {
                    return scope;
                }
                scope = scope.parent;
            }
            return null;
        }
    }
}

export function define(env: Env, name: string, value?: any) {
    if (isUndefined(value)) {
        env.vars[name] = value;
        return null;
    }
    else {
        env.vars[name] = null;
        return null;
    }
}
