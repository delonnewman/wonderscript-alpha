import {murmurhash3_32_gc} from "./murmur";
import {Form} from "../compiler/core";
import {isArray, isBoolean, isMap, isNumber, isSet, isString} from "./runtime";
import {isVector} from "./Vector";
import {prStr} from "../compiler/prStr";
import {isValue, Value} from "./Value";

export const stringHash = function() {
    const SEED = Math.random() * 10000;

    return (s: string): number => murmurhash3_32_gc(s, SEED);
}()

export function hashCombine(seed, hash): number {
    // a la boost, a la clojure
    seed ^= hash + 0x9e3779b9 + (seed << 6) + (seed >> 2)
    return seed
}

const ARRAY_SEED = 2477418380;
const MAP_SEED   = 2930956514;
const SET_SEED   = 3268899600;

export function hashCode(form: Form | Value): number {
    if (isNumber(form)) {
        return form;
    }

    if (isBoolean(form)) {
        return form ? 1 : 0
    }

    if (isString(form)) {
        return stringHash(form);
    }

    if (isValue(form)) {
        return form.hashCode();
    }

    if (isArray(form) || isVector(form)) {
        return Array.prototype.reduce.call(form, (n, x) => hashCombine(n, hashCode(x)), ARRAY_SEED);
    }

    if (isMap(form)) {
        let n = MAP_SEED;
        for (let entry of form) {
            n = hashCombine(n, hashCombine(hashCode(entry[0]), hashCode(entry[1])));
        }
        return n;
    }

    if (isSet(form)) {
        let n = SET_SEED;
        for (let entry of form) {
            n = hashCombine(n, hashCode(entry));
        }
        return n;
    }

    throw new Error(`can't get a hashCode of: ${prStr(form)}`)
}