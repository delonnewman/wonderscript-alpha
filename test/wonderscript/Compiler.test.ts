import { expect, test, describe } from "bun:test";
import { Compiler } from "../../src/wonderscript";

describe("Compiler", () => {
  const Global = {
    Greeter: (class {
      greet_0() {
        return "Hello!";
      }
      greet_1(name: string) {
        return `Hello ${name}!`;
      }
    }),
    global: {
      console: {
        log: (..._: unknown[]) => {},
      },
    },
  };

  const subject = new Compiler("node", "node", Global);

  describe("send", () => {
    test("property access", () => {
      let output = subject.evalString("(send js/global :js.prop/hey)");
      expect(output).toBeUndefined();

      subject.evalString('(send js/global [:js/set! :hey "You"])');
      output = subject.evalString("(send js/global :js.prop/hey)");

      expect(output).toBe("You");
    });

    describe("primitive messages", () => {
      const examples: [string, unknown][] = [
        ["(1 js/type)", "number"],
        ['("hey" js/type)', "string"],
        ['("hey" js/equiv? "hey")', true],
        ['("hey" js/identical? "hey")', true],
        [
          '(def Greeter (fn* () ((js* "this") js/set! :name "John"))) ((Greeter js/new) js.prop/name)',
          "John",
        ],
        [
          "(def Greeter (fn* ())) ((Greeter js/new) js/instance? Greeter)",
          true,
        ],
      ];

      examples.forEach(([form, expected]) => {
        test(`${form} => ${expected}`, () => {
          const output = subject.evalString(form);
          expect(output).toBe(expected);
        });
      });
    });

    describe("method query", () => {
      const examples: [string, boolean][] = [
        ["(send js/global [:respond-to? :js.prop/missingProp])", false],
        ["(send js/global [:respond-to? :js/missingMethod])", false],
        ["(send js/global [:respond-to? :missingMethod])", false],
        ["(js/global respond-to? :missingMethod)", false],
        ["(send js/global [:respond-to? :js/console])", true],
        ["(js/global respond-to? :js/console)", true],
        ["(send js/global [:respond-to? :js.prop/console])", true],
        ["(send js/global [:respond-to? :js.prop/console])", true],
        ["(send js/global [:respond-to? [:js/prop :console :log]])", true],
        ["(send js/global [:respond-to? [:js/prop :console :hi]])", false],
      ];

      examples.forEach(([form, expected]) => {
        test(`${form} => ${expected}`, () => {
          const output = subject.evalString(form);
          expect(output).toBe(expected);
        });
      });
    });

    test("send unary message", () => {
      const output = subject.evalString("(send [1 2 3] :js/toArray)");
      expect(output).toEqual([1, 2, 3]);
    });

    test("send message with args", () => {
      const output = subject.evalString(
        "(send '(1 2 3) [:js/map (fn* (x) (+ 1 x))])"
      );
      expect(output).toEqual([2, 3, 4]);
    });

    test("send message that is passed as a function argument", () => {
      const forms = "((fn* (msg) (send '(1 2 3) msg)) js/call nil :js/toString)";
      const output = subject.evalString(forms);
      expect(output).toEqual("1,2,3");
    });
  });
});
