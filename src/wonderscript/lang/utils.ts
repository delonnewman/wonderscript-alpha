import { murmurhash3_32_gc } from "./murmur";
import { Form } from "../compiler/core";
import { isString } from "../js";
import { Vector } from "./Vector";
import { prStr } from "../compiler/prStr";
import { isValue, Value } from "./Value";

export const stringHash = (function () {
  const SEED = Math.random() * 10000;

  return (s: string): number => murmurhash3_32_gc(s, SEED);
})();

export function hashCombine(seed: number, hash: number): number {
  // a la boost, a la clojure
  seed ^= hash + 0x9e3779b9 + (seed << 6) + (seed >> 2);
  return seed;
}

const ARRAY_SEED = 2477418380;
const MAP_SEED = 2930956514;
const SET_SEED = 3268899600;

export function hashCode(form: Form | Value): number {
  if (typeof form === "number") {
    return form;
  }

  if (typeof form === "boolean") {
    return form ? 1 : 0;
  }

  if (isString(form)) {
    return stringHash(form);
  }

  if (isValue(form)) {
    return form.hashCode();
  }

  if (Array.isArray(form) || form instanceof Vector) {
    return Array.prototype.reduce.call(
      form,
      (n: number, x: number) => hashCombine(n, hashCode(x)),
      ARRAY_SEED
    );
  }

  if (form instanceof Map) {
    let n = MAP_SEED;
    for (let entry of form) {
      n = hashCombine(n, hashCombine(hashCode(entry[0]), hashCode(entry[1])));
    }
    return n;
  }

  if (form instanceof Set) {
    let n = SET_SEED;
    for (let entry of form) {
      n = hashCombine(n, hashCode(entry));
    }
    return n;
  }

  throw new Error(`can't get a hashCode of: ${prStr(form)}`);
}
