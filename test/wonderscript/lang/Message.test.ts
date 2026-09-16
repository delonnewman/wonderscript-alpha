import { expect, test, describe } from "bun:test";
import { Keyword, Message, Vector } from "../../../src/wonderscript/lang";
import { Symbol } from "../../../src/wonderscript/lang/Symbol";

describe("Message", () => {
  describe(".intern", () => {
    test('"test" => "test"', () => {
      const interned = Message.intern("test");
      expect(interned).toBe("test");
    });

    test('\'test => "test"', () => {
      const interned = Message.intern(Symbol.intern("test"));
      expect(interned).toBe("test");
    });

    test(':test => "test"', () => {
      const interned = Message.intern(Keyword.intern("test"));
      expect(interned).toBe("test");
    });

    test('[:test, 1] => "test_1"', () => {
      const message = new Vector(Keyword.intern("test"), 1);
      expect(Message.intern(message)).toBe("test_1");
    });

    test('[:js/test, 1] => "test"', () => {
      const message = new Vector(Keyword.intern("test", "js"), 1);
      expect(Message.intern(message)).toBe("test");
    });

    test('\'(test 1) => "test_1"', () => {
      const message = [Symbol.intern("test"), 1];
      expect(Message.intern(message)).toBe("test_1");
    });
  });

  describe(".args", () => {
    test("[:js/test, 1] => [1]", () => {
      const message = new Vector(Keyword.intern("test", "js"), 1);
      expect(Message.args(message)).toEqual(new Vector(1));
    });
  });
});
