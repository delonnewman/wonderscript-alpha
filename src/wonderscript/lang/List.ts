import {Meta, MetaData} from "./Meta";
import {Nil} from "./Nil";
import {First, Next, Seq} from "./Seq";
import {Seqable} from "./Seqable";
import {Keyword} from "./Keyword";

export class List implements Meta, Seq, Seqable {
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

    cons(x): List {
        return new List(x, this, this._count + 1);
    }

    seq(): List {
        return this;
    }

    meta(): MetaData | Nil {
        return this._meta;
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
}