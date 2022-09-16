import {isList, List} from "./lang/List";
import {isSymbol, Symbol} from "./lang/Symbol";
import {isKeyword, Keyword} from "./lang/Keyword";
import {Namespace} from "./lang/Namespace";
import {isVector, Vector} from "./lang/Vector";
import {Definition, isDefinition} from "./lang/Definition";
import {isModule, Module} from "./lang/Module";

export * from "./lang/Nil"
export * from "./lang/Meta"
export * from "./lang/Named"
export * from "./lang/Sequence"
export * from "./lang/Sequenceable"
export * from "./lang/Symbol"
export * from "./lang/Keyword"
export * from "./lang/List"
export * from "./lang/Namespace"
export * from "./lang/runtime"
export * from "./lang/Vector"
export * from "./lang/Module"
export * from "./lang/Definition"

globalThis.wonderscript ||= {};
globalThis.wonderscript.lang = {
    Symbol,
    isSymbol,
    Keyword,
    isKeyword,
    List,
    isList,
    Namespace,
    Vector,
    isVector,
    Module,
    isModule,
    Definition,
    isDefinition,
}
