import {Meta, MetaData} from "./Meta";
import {Symbol} from "./Symbol";
import {Named} from "./Named";
import {Nil} from "./Nil";
import {Keyword} from "./Keyword";
import {merge} from "./runtime";
import {Reference, Watcher} from "./Reference";
import {Object} from "./Object";

export const MACRO_KW     = Keyword.intern("macro");
// the value will be a symbol, class, protocol, or function that is part of the type system
export const TYPEDEF_KW   = Keyword.intern("typedef");
export const DOC_KW       = Keyword.intern("doc");
export const ADDED_KW     = Keyword.intern("added");
export const CONST_KW     = Keyword.intern("constant");
export const DYNAMIC_KW   = Keyword.intern("dynamic");
export const PRIVATE_KW   = Keyword.intern("private");
// exported automatically with 'use'
export const EXPORT_KW    = Keyword.intern("export");
// made palatable for the outside world
export const EXTERNAL_KW  = Keyword.intern("external");
// a value from the outside world
export const ALIEN_KW     = Keyword.intern("alien");
export const ALIAS_KW     = Keyword.intern("alias");
export const TAG_KW       = Keyword.intern("tag");

export class Definition implements Meta, Named, Reference, Object {
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

    symbol(): Symbol {
        return this._symbol;
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

    get() {
        return this._value;
    }

    set(value: any) {
        return this.reset(value);
    }

    deref() {
        return this.get();
    }

    reset(value: any): Definition {
        if (!this.isDynamic()) {
            throw new Error("cannot change an immutable value");
        }

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

    tag(): Symbol | Nil {
        return this._meta?.get(TAG_KW);
    }

    isMacro(): boolean {
        return this._meta?.get(MACRO_KW) === true;
    }

    isTypeDef(): boolean {
        return this._meta?.get(TYPEDEF_KW) === true;
    }

    isConstant(): boolean {
        return this._meta?.get(CONST_KW) === true;
    }

    isDynamic(): boolean {
        return this._meta?.get(DYNAMIC_KW) === true;
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