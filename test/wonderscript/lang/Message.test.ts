import { expect, test, it, describe } from "bun:test";
import {
  JSSetPropMessage,
  Keyword,
  Message,
  Vector,
} from "../../../src/wonderscript/lang";
import { Symbol } from "../../../src/wonderscript/lang/Symbol";

describe("Message", () => {
  it('has a name', () => {
    const msg = new Message("to_s");
    expect(msg.name).toBe("to_s");
  });

  it("may have a namespace", () => {
    const msg = new Message("toString", "js");
    expect(msg.namespace).toBe("js");
  });

  it('has args', () => {
    const msg = new Message("+", undefined, [1]);
    expect(msg.args).toEqual([1]);
  });

  it("interns it's name and arity", () => {
    const msg = new Message("add", undefined, [1]);
    expect(msg.interned).toBe('add_1');
  });

  describe('JSSetPropMessage', () => {
    const msg = new JSSetPropMessage("prop", "js");
  });

  describe(".intern", () => {
    test('"test" => "test"', () => {
      const interned = Message.intern("test");
      expect(interned).toBe("test");
    });

    test('\'test => "test"', () => {
      const interned = Message.intern(Symbol.intern("test"));
      expect(interned).toBe("test");
    });

    test(':js/test => "test"', () => {
      const interned = Message.intern(Keyword.intern("test"));
      expect(interned).toBe("test");
    });

    test(':js.prop/test => "test"', () => {
      const interned = Message.intern(Keyword.intern("test", "js.prop"));
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

    test(':js.prop/test => nil', () => {
      const interned = Message.args(Keyword.intern("test", 'js.prop'));
      expect(interned).toBeUndefined();
    });
  });
});
