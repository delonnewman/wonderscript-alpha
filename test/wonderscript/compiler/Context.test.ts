import { expect, describe, it } from "bun:test";
import { Context } from "../../../src/wonderscript/lang/Context";
import { Symbol } from "../../../src/wonderscript/lang/Symbol";

describe("Context", () => {
    const subject = new Context();

    it("is initialized with a reference to itself", () => {
        expect(subject.get(Symbol.intern("*ctx*"))).toBe(subject);
    });
});
