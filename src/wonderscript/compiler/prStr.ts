import { FALSE_SYM, NIL_SYM, TRUE_SYM } from "./constants";
import { ArrayLike, isArrayLike } from "../js/ArrayLike";
import { map } from "../lang/runtime";
import { Form } from "./core";
import { Symbol } from "../lang/Symbol";
import { Keyword } from "../lang/Keyword";
import { List } from "../lang/List";
import { Vector } from "../lang/Vector";

const EMPTY_LIST = "()";
const EMPTY_ARRAY = "[]";

export function prStr(form: Form | Function | ArrayLike | Object): string {
  if (form == null) {
    return NIL_SYM;
  }

  if (typeof form === "number") {
    return `${form}`;
  }

  if (typeof form === "boolean") {
    return form ? TRUE_SYM : FALSE_SYM;
  }

  if (form instanceof Symbol || form instanceof Keyword) {
    return form.toString();
  }

  if (
    typeof form === "string" ||
    Object.prototype.toString.call(form) === "[object String]"
  ) {
    return JSON.stringify(form);
  }

  if (form instanceof List) {
    if (form.count() === 0) {
      return EMPTY_LIST;
    }

    const parts = map(prStr, form);
    return `(${parts.join(" ")})`;
  }

  if (Array.isArray(form)) {
    const parts = [];
    for (let i = 0; i < form.length; i++) {
      parts.push(prStr(form[i]));
    }
    return `(${parts.join(" ")})`;
  }

  if (form instanceof Vector) {
    if (form.length === 0) {
      return EMPTY_ARRAY;
    }

    const parts = Array.prototype.map.call(form, prStr);
    return `[${parts.join(" ")}]`;
  }

  if (form instanceof Map) {
    const parts = [];
    for (let entry of form) {
      const key = prStr(entry[0]);
      const val = prStr(entry[1]);
      parts.push(`${key} ${val}`);
    }
    return `{${parts.join(" ")}}`;
  }

  if (form instanceof Set) {
    const parts = [];
    for (let entry of form) {
      const val = prStr(entry);
      parts.push(val);
    }
    return `#{${parts.join(" ")}}`;
  }

  if (typeof form === "function") {
    return `#js/function "${form}"`;
  }

  if (isArrayLike(form)) {
    const parts = Array.prototype.map.call(
      form,
      (x: unknown, i: number) => `${i} ${prStr(x)}`
    );
    return `#js/object {${parts.join(", ")}}`;
  }

  if (typeof form === "object") {
    const keys = Object.keys(form);
    const ctrName = Object.getPrototypeOf(form)?.constructor?.name ?? "object";
    return `#js/${ctrName} {${keys.map((k) => `${prStr(k)} ${prStr(form[k])}`).join(", ")}}`;
  }

  return `${form}`;
}
