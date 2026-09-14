import { expect, test, describe } from "bun:test";
import { readString } from "../../../src/wonderscript/compiler/readString";
import { ARRAY_SYM, QUOTE_SYM } from "../../../src/wonderscript/reader/syntaxQuoteReader";
import { Symbol } from "../../../src/wonderscript/lang/Symbol";
import { SEND_SYM } from "../../../src/wonderscript/compiler/emit/emitSend";

describe("syntaxQuoteReader", () => {
    test("trivial quoting", () => {
        const { form: form } = readString("`(a 2 3)")[0];
        expect(form).toEqual([ARRAY_SYM, [QUOTE_SYM, Symbol.intern('a')], 2, 3]);
    });
    test("unquoting", () => {
        const { form: form } = readString("`(1 ~x 3)")[0];
        expect(form).toEqual([ARRAY_SYM, 1, Symbol.intern('x'), 3]);
    });
    test("spliced unquoting", () => {
        const { form: actual } = readString("`(1 ~@x 3)")[0];

        const expected = [SEND_SYM, [ARRAY_SYM, 1], [Symbol.intern('concat'), Symbol.intern('x'), [ARRAY_SYM, 3]]];
        expect(actual).toEqual(expected);
    });
});
