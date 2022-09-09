import {Meta, MetaData} from "./Meta";
import {Symbol} from "./Symbol";
import {Named} from "./Named";
import {Nil} from "./Nil";
import {Keyword} from "./Keyword";
import {merge} from "./runtime";
import {Reference, Watcher} from "./Reference";

export const MACRO_KW     = Keyword.intern("macro");
// the value will be a symbol, class, protocol, or function that is part of the type system
export const TYPE_KW      = Keyword.intern("type");
export const DOC_KW       = Keyword.intern("doc");
export const ADDED_KW     = Keyword.intern("added");
export const CONST_KW     = Keyword.intern("constant");
export const VAR_KW       = Keyword.intern("variable");
// exported automatically with 'use'
export const EXPORT_KW    = Keyword.intern("export");
// made palatable for the outside world
export const EXTERNAL_KW  = Keyword.intern("external");
// a value from the outside world
export const ALIEN_KW     = Keyword.intern("alien");
export const ALIAS_KW     = Keyword.intern("alias");
// the type signature of a value
export const SIGNATURE_KW = Keyword.intern("signature");

export class Definition implements Meta, Named, Reference {
    private readonly _symbol: Symbol;
    private _meta: MetaData;
    private _value: any;
    private readonly _watchers: { [key: string]: Function };

    constructor(symbol: Symbol, value?: any, meta?: MetaData) {
        this._symbol = symbol;
        this._value = value;
        this._meta = meta ?? symbol.meta();
        this._watchers = {};
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

    meta(): MetaData | Nil {
        return this._meta;
    }

    hasMeta(): boolean {
        return this._meta != null;
    }

    setMeta(key: Keyword, value: any): Definition {
        this._meta = this._meta ?? new Map<Keyword, any>();

        this._meta.set(key, value);

        return this;
    }

    withMeta(data: MetaData): Definition {
        return new Definition(this._symbol, merge(this._meta, data));
    }

    resetMeta(data: MetaData): Definition {
        this._meta = data;

        return this;
    }

    deref() {
        return this._value;
    }

    reset(value: any): Definition {
        Object.entries(this._watchers).forEach(([key, f]) => {
            f.call(this, this._value, value, key, this);
        });

        this._value = value;

        return this;
    }

    swap(f: (value: any) => any): Definition {
        return this.reset(f(this._value));
    }

    addWatcher(key: string, f: Watcher): Definition {
        this._watchers[key] = f;

        return this;
    }

    removeWatcher(key: string): Definition {
        delete this._watchers[key];

        return this;
    }

    hasWatcher(key: string): boolean {
        return this._watchers[key] != null;
    }

    documentation(): string | Nil {
        return this._meta?.get(DOC_KW);
    }

    isDocumented(): boolean {
        return this.documentation() != null;
    }

    added(): string | Nil {
        return this._meta?.get(ADDED_KW);
    }

    signature(): any | Nil {
        return this._meta?.get(SIGNATURE_KW);
    }

    isMacro(): boolean {
        return this._meta?.get(MACRO_KW) === true;
    }

    isType(): boolean {
        return this._meta?.get(TYPE_KW) === true;
    }

    isConstant(): boolean {
        return this._meta?.get(CONST_KW) === true;
    }

    isVariable(): boolean {
        return this._meta?.get(VAR_KW) === true;
    }

    isExport(): boolean {
        return this._meta?.get(EXPORT_KW) === true;
    }

    isExternal(): boolean {
        return this._meta?.get(EXTERNAL_KW) === true;
    }

    isAlien(): boolean {
        return this._meta?.get(ALIEN_KW) === true;
    }

    isAlias(): boolean {
        return this._meta?.get(ALIAS_KW) === true;
    }
}