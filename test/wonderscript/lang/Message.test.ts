import { expect, test, it, describe } from "bun:test";
import {
  JSSetPropMessage,
  Keyword,
  Message,
} from "../../../src/wonderscript/lang";

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
    const msg = new Message("to_s");
    expect(msg.name).toBe("to_s");
  });

  it("may have a namespace", () => {
    const msg = new Message("toString", "js");
    expect(msg.namespace).toBe("js");
  });

  it("has args", () => {
    const msg = new Message("+", undefined, [1]);
    expect(msg.args).toEqual([1]);
  });

  it("interns it's name and arity", () => {
    const msg = new Message("add", undefined, [1]);
    expect(msg.interned).toBe("add_1");
  });

  describe("JSSetPropMessage", () => {
    const msg = new JSSetPropMessage("prop", "js");
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
    it("can bind to a function", () => {
      expect(actual).toBe(expected);
    });
  });
});
