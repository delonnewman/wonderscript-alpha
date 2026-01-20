export * from "./js/ArrayLike";
export * from "./js/predicates";

import { isArrayLike } from "./js/ArrayLike";

globalThis.wonderscript ??= {};
globalThis.wonderscript.js = {
  isArrayLike,
};
