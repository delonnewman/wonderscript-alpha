export class Vector<T = unknown> {
  readonly length: number;

  static fromArray<T = unknown>(array: T[]) {
    return new this(...array);
  }

  constructor(...array: T[]) {
    this.length = array.length;

    for (let i = 0; i < array.length; i++) {
      this[i] = array[i];
    }

    Object.freeze(this);
  }

  invoke(n: number) {
    return this[n];
  }

  at(n: number): T {
    return this[n];
  }

  slice(...args: unknown[]): Vector {
    return new Vector(...Array.prototype.slice.apply(this, args));
  }

  map<T>(...args: unknown[]): Vector {
    return new Vector<T>(...Array.prototype.map.apply(this, args));
  }

  join(...args: unknown[]) {
    return Array.prototype.join.apply(this, args);
  }

  [Symbol.iterator]() {
    return Array.prototype[Symbol.iterator].apply(this);
  }

  toArray() {
    return Array.prototype.slice.call(this);
  }

  prepend(value: T) {
    const elems = this.toArray();
    elems.unshift(value);
    return new Vector(...elems);
  }

  append(value: T) {
    const elems = this.toArray();
    elems.push(value);
    return new Vector(...elems);
  }
}
