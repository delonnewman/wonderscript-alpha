import {MetaData} from "./Meta";
import {Keyword} from "./Keyword";

export type Watcher = (previous: any, current: any, key?: string, ref?: Reference) => void

export interface Reference {
    setMeta(key: Keyword, value: any): Reference;
    resetMeta(data: MetaData): Reference;
    deref(): any;
    reset(value: any): Reference;
    swap(f: (value: any) => any): Reference;
    addWatcher(key: string, f: Watcher): Reference;
    removeWatcher(key: string): Reference;
    hasWatcher(key: string): boolean;
}