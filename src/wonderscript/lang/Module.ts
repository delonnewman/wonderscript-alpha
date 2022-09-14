import {ALIEN_KW, Definition} from "./Definition";
import {Symbol} from "./Symbol";
import {MetaData} from "./Meta";
import {merge} from "./runtime";
import {Context} from "./Context";

export type DefinitionMap = Map<string, Definition>;

export class Module {
    readonly name: Symbol
    private readonly _definitions: DefinitionMap;
    private readonly ctx;

    static CORE = new Module(Symbol.intern("wonderscript.core"));

    constructor(name: Symbol, ctx = Context.withinModule()) {
        this.name = name;
        this.ctx = ctx;
        this._definitions = new Map<string, Definition>();
    }

    definitionMap(): DefinitionMap {
        return this._definitions;
    }

    definitions(): Definition[] {
        return Array.from(this._definitions.values());
    }

    addDefinition(def: Definition): Module {
        this._definitions.set(def.symbol().toString(), def);

        return this;
    }

    define(name: Symbol, value, meta?: MetaData): Module {
        return this.addDefinition(new Definition(name, value, meta));
    }

    importSymbol(name: string, value, meta?: MetaData): Module {
        return this.define(Symbol.intern(name), value, meta);
    }

    importModule(module: object, meta?: MetaData): Module {
        Object.entries(module).forEach(([name, value]) => {
            this.importSymbol(name, value, meta)
        });

        return this;
    }

    importAlienModule(module: object, meta?: MetaData): Module {
        return this.importModule(module, merge(meta, new Map([[ALIEN_KW, true]])))
    }

    get(sym: Symbol): Definition {
        return this._definitions.get(sym.toString());
    }

    exports(): Definition[] {
        return this.definitions()
            .filter((d) => d.isExport());
    }

    exportNames(): Symbol[] {
        return this.exports()
            .map((d) => d.symbol());
    }

    toString() {
        return `#<Module ${this.name}>`;
    }
}

export const isModule = (value: unknown): value is Module =>
    value instanceof Module;