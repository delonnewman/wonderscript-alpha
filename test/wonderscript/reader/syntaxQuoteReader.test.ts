import { expect, test, describe } from "bun:test";
import { readString } from "../../../src/wonderscript/compiler/readString";
import {
  ARRAY_SYM,
  QUOTE_SYM,
} from "../../../src/wonderscript/reader/syntaxQuoteReader";
import { Symbol } from "../../../src/wonderscript/lang/Symbol";
import { SEND_SYM } from "../../../src/wonderscript/compiler/emit/emitSend";
import { p } from "../../../src/wonderscript/util";

describe("syntaxQuoteReader", () => {
  test("trivial quoting", () => {
    const { form: form } = readString("`(a 2 3)")[0];
    expect(form).toEqual([ARRAY_SYM, [QUOTE_SYM, Symbol.intern("a")], 2, 3]);
  });
  test("unquoting", () => {
    const { form: form } = readString("`(1 ~x 3)")[0];
    expect(form).toEqual([ARRAY_SYM, 1, Symbol.intern("x"), 3]);
  });
  test("unquoting", () => {
    const { form: form } = readString("`(1 ~x ~y)")[0];
    expect(form).toEqual([
      ARRAY_SYM,
      1,
      Symbol.intern("x"),
      Symbol.intern("y"),
    ]);
  });
  test("unquoting and spliced unquoting together", () => {
    const { form: actual } = readString("`(1 ~x ~@ys)")[0];

    const expected = [
      SEND_SYM,
      [ARRAY_SYM, 1, Symbol.intern("x")],
      [Symbol.intern("concat"), Symbol.intern("ys"), [ARRAY_SYM]],
    ];
    p(actual);
    p(expected);
    expect(actual).toEqual(expected);
  });
  test("unquoting and spliced unquoting together", () => {
    const { form: actual } = readString("`(a ~x 4 ~@ys 5)")[0];

    const expected = [
      SEND_SYM,
      [ARRAY_SYM, [QUOTE_SYM, Symbol.intern("a")], Symbol.intern("x"), 4],
      [Symbol.intern("concat"), Symbol.intern("ys"), [ARRAY_SYM, 5]],
    ];
    p(actual);
    p(expected);
    expect(actual).toEqual(expected);
  });
  test("spliced unquoting with 3 forms", () => {
    const { form: actual } = readString("`(1 ~@x 3)")[0];

    const expected = [
      SEND_SYM,
      [ARRAY_SYM, 1],
      [Symbol.intern("concat"), Symbol.intern("x"), [ARRAY_SYM, 3]],
    ];
    p(actual);
    p(expected);
    expect(actual).toEqual(expected);
  });
  test("spliced unquoting with 4 forms", () => {
    const { form: actual } = readString("`(1 ~@x 3 4)")[0];

    const expected = [
      SEND_SYM,
      [ARRAY_SYM, 1],
      [
        Symbol.intern("concat"),
        Symbol.intern("x"),
        [ARRAY_SYM, 3],
        [ARRAY_SYM, 4],
      ],
    ];
    p(actual);
    p(expected);
    expect(actual).toEqual(expected);
  });
});
