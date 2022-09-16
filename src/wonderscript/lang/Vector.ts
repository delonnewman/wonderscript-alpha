export class Vector {
    readonly length: number

    constructor(array) {
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

    slice(start, end): Vector {
        return new Vector(Array.prototype.slice.call(this, start, end));
    }
}

export function isVector(obj): obj is Vector {
    return obj instanceof Vector;
}