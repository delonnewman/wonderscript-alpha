import {Meta, MetaData} from "./Meta";
import {Nil} from "./Nil";
import {First, isSequence, Next, Sequence} from "./Sequence";
import {Sequenceable} from "./Sequenceable";
import {merge, reduce} from "./runtime";
import {Value} from "./Value";
import {hashCode, hashCombine, stringHash} from "./utils";

const HASH_SEED = 4221954417;

export class List implements Meta, Sequence, Sequenceable, Value {
    static EMPTY = new this(null, null);

    private readonly _first: First;
    private readonly _next: Next;
    private readonly _count: number;
    private readonly _meta: MetaData | Nil;
    private _hashCode: number | null;

    constructor(first: First, next: Next, count = 0, meta?: MetaData) {
        this._first = first;
        this._next  = next;
        this._count = count;
        this._meta  = meta;
        this._hashCode = null;
    }

    empty(): List {
        return List.EMPTY;
    }

    cons(x): List {
        return new List(x, this, this._count + 1);
    }

    seq(): List {
        return this;
    }

    meta(): MetaData | Nil {
        return this._meta;
    }

    withMeta(data: MetaData): List {
        return new List(this._first, this._next, this._count, merge(this._meta, data));
    }

    hasMeta(): boolean {
        return this._meta != null;
    }

    first(): First {
        return this._first;
    }

    next(): Next {
        return this._next;
    }

    count(): number {
        return this._count;
    }

    equals(other: Sequence): boolean {
        if (!isSequence(other)) return false;
        // TODO: generalize to isCounted add counted interface
        if (isList(other) && this.count() !== other.count())  {
            return false;
        }

        let x = this.first();
        let xs: Sequence = this;
        let y = other.first();
        let ys = other;

        while (xs != null && ys != null) {
            if (x !== y) return false; // TODO: toplevel equals needs to be accessible here
            xs = xs.next();  ys = ys.next();
            x  = xs.first(); y  = ys.first();
        }

        return xs == null && ys == null;
    }

    hashCode(): number {
        if (this._hashCode == null) {
            this._hashCode = reduce((n, x) => hashCombine(n, hashCode(x)), this, HASH_SEED);
        }

        return this._hashCode;
    }
}

export const isList = (value: any): value is List =>
    value instanceof List;