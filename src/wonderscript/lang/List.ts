import {Meta, MetaMap} from "./Meta";
import {Nil} from "./Nil";
import {First, Next, Seq} from "./Seq";
import {Seqable} from "./Seqable";

export class List implements Meta, Seq, Seqable {
    private readonly _first: First
    private readonly _next: Next
    private readonly _count: number
    private readonly _meta: MetaMap | Nil

    constructor(first: First, next: Next, count = 0, meta?: MetaMap) {
        this._first = first
        this._next  = next
        this._count = count
        this._meta = meta
    }

    seq(): Seq {
        return this;
    }

    meta(): MetaMap | Nil {
        return this._meta
    }

    first(): First {
        return this._first
    }

    next(): Next {
        return this._next
    }

    count(): number {
        return this._count
    }
}