import {ALIEN_KW, Definition} from "./Definition";
import {Symbol} from "./Symbol";
import {MetaData} from "./Meta";
import {merge} from "./runtime";

export type DefinitionMap = Map<Symbol, Definition>;

export class Module {
    readonly name: Symbol
    private readonly _definitions: DefinitionMap;

    constructor(name: Symbol) {
        this.name = name;
        this._definitions = new Map<Symbol, Definition>();
    }

    definitionMap(): DefinitionMap {
        return this._definitions;
    }

    definitions(): Definition[] {
        return Array.from(this._definitions.values());
    }

    addDefinition(def: Definition): Module {
        this._definitions.set(def.symbol().withoutMeta(), def);

        return this;
    }

    importSymbol(name: Symbol, value, meta?: MetaData): Module {
        return this.addDefinition(new Definition(name, value, meta));
    }

    importAlienSymbol(name: string, value, meta?: MetaData): Module {
        return this.importSymbol(Symbol.intern(name), value, merge(meta, new Map([[ALIEN_KW, true]])));
    }

    importAlienModule(module: object): Module {
        Object.entries(module).forEach(([name, value]) => {
            this.importAlienSymbol(name, value)
        });

        return this;
    }

    get(name: Symbol): Definition {
        return this._definitions.get(name);
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