export type Watcher = (
  previous: any,
  current: any,
  key?: string,
  ref?: Reference
) => void;

export interface Reference<T = unknown> {
  deref(): T;
  reset(value: T): Reference<T>;
  swap(f: (value: T) => T): Reference<T>;
  addWatcher(key: string, f: Watcher): Reference<T>;
  removeWatcher(key: string): Reference<T>;
  hasWatcher(key: string): boolean;
}
