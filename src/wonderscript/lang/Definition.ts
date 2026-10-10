import { Meta, MetaData } from "./Meta";
import { Symbol } from "./Symbol";
import { Named } from "./Named";
import { Keyword } from "./Keyword";
import { merge } from "./runtime";
import { Reference, Watcher } from "./Reference";

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

  symbol(): Symbol {
    return this._symbol;
  }

  get name(): string {
    return this._symbol.name;
  }

  get namespace(): string | null | undefined {
    return this._symbol.namespace;
  }

  hasNamespace(): boolean {
    return this._symbol.hasNamespace();
  }

  meta(): MetaData | null | undefined {
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

  documentation(): string | null | undefined {
    return this._meta?.get(Keyword.intern("doc"));
  }

  isDocumented(): boolean {
    return this.documentation() != null;
  }

  added(): string | null | undefined {
    return this._meta?.get(Keyword.intern("added"));
  }

  signature(): any | null | undefined {
    return this._meta?.get(Keyword.intern("signature"));
  }

  isMacro(): boolean {
    return this._meta?.get(Keyword.intern("macro")) === true;
  }

  isType(): boolean {
    return this._meta?.get(Keyword.intern("type")) === true;
  }

  isConstant(): boolean {
    return this._meta?.get(Keyword.intern("const")) === true;
  }

  isVariable(): boolean {
    return this._meta?.get(Keyword.intern("var")) === true;
  }

  isExport(): boolean {
    return this._meta?.get(Keyword.intern("export")) === true;
  }

  isExternal(): boolean {
    return this._meta?.get(Keyword.intern("external")) === true;
  }

  isAlien(): boolean {
    return this._meta?.get(Keyword.intern("alien")) === true;
  }

  isAlias(): boolean {
    return this._meta?.get(Keyword.intern("alias")) === true;
  }
}
