import {Meta, MetaData} from "./Meta";
import {Nil} from "./Nil";
import {First, isSeq, Next, Seq} from "./Seq";
import {Seqable} from "./Seqable";
import {Keyword} from "./Keyword";

export class List implements Meta, Seq, Seqable, Equality {
    static EMPTY = new this(null, null);

    private readonly _first: First;
    private readonly _next: Next;
    private readonly _count: number;
    private _meta: MetaData | Nil;

    constructor(first: First, next: Next, count = 0, meta?: MetaData) {
        this._first = first;
        this._next  = next;
        this._count = count;
        this._meta  = meta;
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
        return new List(this._first, this._next, this._count, data);
    }

    setMeta(key: Keyword, value: any): List {
        if (this._meta == null) {
            this._meta = new Map();
        }

        this._meta.set(key, value)

        return this;
    }

    resetMeta(data: Map<Keyword, any>): List {
        this._meta = data;

        return this;
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

    equals(other: Seq): boolean {
        if (!isSeq(other)) return false;
        // TODO: generalize to isCounted add counted interface
        if (isList(other) && this.count() !== other.count())  {
            return false;
        }

        let x = this.first();
        let xs: Seq = this;
        let y = other.first();
        let ys = other;

        while (xs != null && ys != null) {
            if (x !== y) return false; // TODO: toplevel equals needs to be accessible here
            xs = xs.next();
            ys = ys.next();
            x  = xs.first();
            y  = ys.first();
        }

        return xs == null && ys == null;
    }
}

export const isList = (value: any): value is List =>
    value instanceof List;