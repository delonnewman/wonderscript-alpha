// @ts-ignore
import { expect, test, describe } from "bun:test";
import { analyze } from "../../src/wonderscript/analyze";
import { prStr } from "../../src/wonderscript/compiler";
import { Form } from "../../src/wonderscript/compiler/core";
import { Symbol } from "../../src/wonderscript/lang/Symbol";
import { Dialog } from "../../src/wonderscript/lang/Dispatch/Dialog";
import { UnaryMessage } from "../../src/wonderscript/lang/Message/UnaryMessage";
import { ArgListMessage } from "../../src/wonderscript/lang/Message/ArgListMessage";
import { Identity } from "../../src/wonderscript/lang/Dispatch/Identity";
import { pt } from "../../src/wonderscript/util";

describe("analyze", () => {
  const examples: [Form, unknown][] = [
    [
      [Symbol.intern("def"), [Symbol.intern('TrueClass'), Symbol.intern('to_s')], "true"],
      new Dialog(Symbol.intern('TrueClass'), new ArgListMessage("define-method", undefined, [Symbol.intern("to_s"), "true"]))
    ]
  ];

  examples.forEach(([example, expected]) => {
    test(`${prStr(example)} => ${prStr(expected)}`, () => {
      const result = analyze(example);
      expect(result).toEqual(expected);
    });
  });
});