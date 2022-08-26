export type Nil = undefined | null

export function isNil(x): x is Nil {
    return x == null;
}

