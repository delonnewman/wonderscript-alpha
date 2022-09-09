import {List} from "./lang/List";
import {Symbol} from "./lang/Symbol";
import {Keyword} from "./lang/Keyword";
import {Namespace} from "./lang/Namespace";

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

globalThis.wonderscript ||= {};
globalThis.wonderscript.lang = {
    Symbol,
    Keyword,
    List,
    Namespace,
}
