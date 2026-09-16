import { expect, test, describe } from "bun:test";
import { Compiler } from "../../src/wonderscript";

describe("Compiler", () => {
  const subject = new Compiler("node", "node", { global: {} });

  test("slot access", () => {
    let output = subject.evalString('(slot-get js/global "hey")');
    expect(output).toBeUndefined();

    subject.evalString('(slot-set! js/global "hey" "You")');
    output = subject.evalString('(slot-get js/global "hey")');

    expect(output).toBe("You");
  });

  describe("send", () => {
    test("send unary message", () => {
      const output = subject.evalString('(send [1 2 3] :js/toArray)');
      expect(output).toEqual([1, 2, 3]);
    })

    test("send message with args", () => {
      const output = subject.evalString("(send '(1 2 3) [:js/map (fn* (x) (+ 1 x))])");
      expect(output).toEqual([2, 3, 4]);
    });

    test("send message that is passed as a function argument", () => {
      const forms = "((fn* (msg) (send '(1 2 3) msg)) :js/toString)";
      const code = subject.compileString(forms)
      const output = subject.evalString(forms);
      console.error(code);
      expect(output).toEqual('1,2,3');
    });
  });
});
