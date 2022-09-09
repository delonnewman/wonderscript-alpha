import {Keyword} from "./Keyword";
import {Meta, MetaData} from "./Meta";

export interface Object extends Meta {
    get()
    set(value: any): Object
    setMeta(key: Keyword, value): Object
    resetMeta(data: MetaData): Object
}