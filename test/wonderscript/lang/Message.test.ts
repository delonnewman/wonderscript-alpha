import { expect, test, it, describe } from "bun:test";
import { Keyword, Message } from "../../../src/wonderscript/lang";
import { JSPropMessage } from "../../../src/wonderscript/lang/Message/JSPropMessage";
import { prStr } from "../../../src/wonderscript/compiler";
import { BaseMessage } from "../../../src/wonderscript/lang/Message/BaseMessage";

declare global {
  interface Object {
    [key: string]: unknown;
    prototype: {
      toString: () => string;
    }
  }
}

// @ts-ignore
var Object: Object = globalThis.Object;

describe("Message", () => {
  it("has a name", () => {
    const msg = new BaseMessage("to_s");
    expect(msg.name).toBe("to_s");
  });

  it("may have a namespace", () => {
    const msg = new BaseMessage("toString", "js");
    expect(msg.namespace).toBe("js");
  });

  it("has args", () => {
    const msg = new BaseMessage("+", undefined, [1]);
    expect(msg.args).toEqual([1]);
  });

  it("interns it's name and arity", () => {
    const msg = new BaseMessage("add", undefined, [1]);
    expect(msg.interned).toBe("add_1");
  });

  describe("JSPropMessage", () => {
    const msg = new JSPropMessage(
      "prop",
      "js",
      [Keyword.intern("prototype"), Keyword.intern("toString")],
    );

    test('name is "prop"', () => {
      expect(msg.name).toBe("prop")
    });

    test('namespace is "js"', () => {
      expect(msg.namespace).toBe("js");
    });

    it('is not within a query message by default', () => {
      expect(msg.isWithinQuery()).toBe(false);
    })

    it("interns to the last prop listed", () => {
      expect(msg.interned).toBe("toString");
    });

    it("has args that correspond to a chain of props", () => {
      expect(msg.args).toEqual([Keyword.intern("prototype"), Keyword.intern('toString')]);
    });

    describe('within a query message', () => {
      it("is within a query message", () => {
        expect(msg.withinQuery().isWithinQuery()).toBe(true);
      });

      it("interns to the last prop listed", () => {
        expect(msg.withinQuery().interned).toBe("toString");
      });

      it("has args that correspond to all but the last prop", () => {
        expect(msg.withinQuery().args).toEqual([Keyword.intern("prototype")]);
      });
    });
  });

  const examples = [
    [
      Message.build([
        Keyword.intern("prop", "js"),
        Keyword.intern("prototype"),
        Keyword.intern("toString"),
      ]).sendTo(Object),
      Object.prototype.toString,
    ],
  ];

  examples.forEach(([actual, expected]) => {
    test(`${prStr(actual)} => ${expected}`, () => {
      expect(actual).toBe(expected);
    });
  });
});
