import { Definition } from "./Definition";
import { Symbol } from "./Symbol";
import { MetaData } from "./Meta";
import { merge } from "./merge";
import { Keyword } from "./Keyword";

export type DefinitionMap = Map<string, Definition>;

export class Package {
  readonly name: Symbol;
  #definitions: DefinitionMap;

  constructor(name: Symbol) {
    this.name = name;
    this.#definitions = new Map<string, Definition>();
  }

  definitionMap(): DefinitionMap {
    return this.#definitions;
  }

  definitions(): Definition[] {
    return Array.from(this.#definitions.values());
  }

  addDefinition(def: Definition): Package {
    this.#definitions.set(def.symbol().name, def);

    return this;
  }

  importSymbol(name: Symbol, value: unknown, meta?: MetaData): Package {
    return this.addDefinition(new Definition(name, value, meta));
  }

  importAlienSymbol(name: string, value: unknown, meta?: MetaData): Package {
    return this.importSymbol(
      Symbol.intern(name),
      value,
      merge(meta, new Map([[Keyword.intern("alien"), true]]))
    );
  }

  importAlienModule(module: object): Package {
    Object.entries(module).forEach(([name, value]) => {
      this.importAlienSymbol(name, value);
    });

    return this;
  }

  get(symbol: Symbol): Definition {
    const def = this.#definitions.get(symbol.name);
    if (def == null) {
      throw new Error(`undefined symbol ${symbol} in package ${this.name}`);
    }

    return def;
  }

  exports(): Definition[] {
    return this.definitions().filter((d) => d.isExport());
  }

  exportNames(): Symbol[] {
    return this.exports().map((d) => d.symbol());
  }

  toString() {
    return `#<Package ${this.name}>`;
  }
}
