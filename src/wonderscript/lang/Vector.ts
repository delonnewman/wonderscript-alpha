export class Vector<T = unknown> {
  readonly length: number;

  constructor(array: T[]) {
    this.length = array.length;

    for (let i = 0; i < array.length; i++) {
      this[i] = array[i];
    }

    Object.freeze(this);
  }

  invoke(n: number) {
    return this[n];
  }

  at(n: number) {
    return this[n];
  }

  slice(start: number, end: number): Vector {
    return new Vector(Array.prototype.slice.call(this, start, end));
  }
}
