import { expect, describe, it } from "bun:test";
import { Context } from "../../../src/wonderscript/lang/Context";
import { Symbol } from "../../../src/wonderscript/lang/Symbol";

describe("Context", () => {
  const file = "test.ws";
  const line = 304;
  const column = 11;

  const subject = new Context();
  subject.setSource(file);
  subject.setLine(line);
  subject.setColumn(column);

  it("is initialized with a reference to itself", () => {
    expect(subject.get(Symbol.intern("*ctx*"))).toBe(subject);
  });

  it("can construct a stackframe", () => {
    const frame = subject.stackframe();

    expect(frame.toString()).toEqual("    at test.ws:304:11");
  });
});
