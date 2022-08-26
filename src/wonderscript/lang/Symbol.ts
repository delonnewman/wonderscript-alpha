import {Named} from "./Named";
import {Meta, MetaMap} from "./Meta";
import {Nil} from "./Nil";

export class Symbol implements Named, Meta {
    private readonly _name: string;
    private readonly _namespace?: string;
    private readonly _meta?: MetaMap;

    constructor(name: string, namespace?: string, meta?: MetaMap) {
        this._name = name;
        this._namespace = name;
        this._meta = meta
    }

    meta(): MetaMap {
        return this._meta;
    }

    name(): string {
        return this._name;
    }

    namespace(): string | Nil {
        return this._namespace;
    }

    toString() {
        if (this._namespace) {
            return `${this._namespace}/${this._name}`;
        }

        return this._name;
    }
}