// @ts-ignore
import { expect, test, describe } from "bun:test";
import { readString } from "../../../src/wonderscript/reader";
import {
  ARRAY_SYM,
  QUOTE_SYM,
} from "../../../src/wonderscript/reader/syntaxQuoteReader";
import { Symbol } from "../../../src/wonderscript/lang/Symbol";
import { SEND_SYM } from "../../../src/wonderscript/compiler/emit/emitSend";
import { Keyword } from "../../../src/wonderscript/lang/Keyword";
import { prStr } from "../../../src/wonderscript/compiler";

describe("syntaxQuoteReader", () => {
  const examples: [string, unknown][] = [
    ["`(a 2 3)", [ARRAY_SYM, [QUOTE_SYM, Symbol.intern("a")], 2, 3]],
    ["`(1 ~x 3)", [ARRAY_SYM, 1, Symbol.intern("x"), 3]],
    ["`(1 ~x ~y)", [ARRAY_SYM, 1, Symbol.intern("x"), Symbol.intern("y")]],
    [
      "`(1 ~x ~@ys)",
      [
        SEND_SYM,
        [ARRAY_SYM, 1, Symbol.intern("x")],
        [Keyword.intern("concat", "js"), Symbol.intern("ys"), [ARRAY_SYM]],
      ],
    ],
    [
      "`(a ~x 4 ~@ys 5)",
      [
        SEND_SYM,
        [ARRAY_SYM, [QUOTE_SYM, Symbol.intern("a")], Symbol.intern("x"), 4],
        [Keyword.intern("concat", "js"), Symbol.intern("ys"), [ARRAY_SYM, 5]],
      ],
    ],
    [
      "`(1 ~@xs 3)",
      [
        SEND_SYM,
        [ARRAY_SYM, 1],
        [Keyword.intern("concat", "js"), Symbol.intern("xs"), [ARRAY_SYM, 3]],
      ],
    ],
    [
      "`(1 ~@xs 3 4)",
      [
        SEND_SYM,
        [ARRAY_SYM, 1],
        [
          Keyword.intern("concat", "js"),
          Symbol.intern("xs"),
          [ARRAY_SYM, 3],
          [ARRAY_SYM, 4],
        ],
      ],
    ],
  ];

  examples.forEach(([input, expected]) => {
    test(`${input} => ${prStr(expected)}`, () => {
      const { form: actual } = readString(input)[0];
      expect(actual).toEqual(expected);
    });
  });
});
