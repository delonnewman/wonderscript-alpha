import { expect, test, it, describe } from "bun:test";
import {
  JSSetPropMessage,
  Message,
} from "../../../src/wonderscript/lang";

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
});
