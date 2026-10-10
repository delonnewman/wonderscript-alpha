// @ts-ignore
import { expect, test, describe } from "bun:test";
import { Interpreter } from "../../src/wonderscript/Interpreter";
import { prStr } from "../../src/wonderscript/compiler";
import { Keyword } from "../../src/wonderscript/lang/Keyword";
import { Vector } from "../../src/wonderscript/lang/Vector";

describe("Interpreter", () => {
  const subject = new Interpreter();

  describe("self evaluating", () => {
    const examples: [string, unknown][] = [
      ["42", 42],
      ["3.14", 3.14],
      ['"hello"', "hello"],
      ["true", true],
      ["false", false],
      ["nil", undefined],
      [":hi", Keyword.intern("hi")]
    ];

    examples.forEach(([form, expected]) => {
      test(`${form} => ${prStr(expected)}`, () => {
        const output = subject.evalString(form);
        expect(output).toBe(expected);
      });
    });
  });

  describe("collections", () => {
    const examples: [string, unknown][] = [
      ["[1 2 3]", new Vector(1, 2, 3)],
      ["[1 [2 3] 4]", new Vector(1, new Vector(2, 3), 4)],
      ["[1 [2 [3 4]] 5]", new Vector(1, new Vector(2, new Vector(3, 4)), 5)],
      ['{"a" 1 "b" 2}', new Map([["a", 1], ["b", 2]])],
      ['{"a" 1 "b" {"c" 2}}', new Map([["a", 1], ["b", new Map([["c", 2]])]])],
      ['#{1 2 3}', new Set([1, 2, 3])],
      ['#{1 #{2 3} 4}', new Set([1, new Set([2, 3]), 4])]
    ];

    examples.forEach(([form, expected]) => {
      test(`${form} => ${prStr(expected)}`, () => {
        const output = subject.evalString(form);
        expect(output).toEqual(expected);
      });
    });
  });

  describe("special forms", () => {
    const examples: [string, unknown][] = [
      ['(def (true to_s) "true") (true to_s)', "true"],
      ["(def (true not) false) (true not)", false],
      ["(begin 1 2 3)", 3],
    ];

    examples.forEach(([form, expected]) => {
      test(`${form} => ${prStr(expected)}`, () => {
        const output = subject.evalString(form);
        expect(output).toBe(expected);
      });
    });

    test(`(do 1 2 3) => 3`, () => {
      const output = subject.evalString("(do 1 2 3)");
      expect(output.dispatch()).toBe(3);
    });
  });

  describe("primitive messages", () => {
    const examples: [string, unknown][] = [
      ["(1 + 5)", 6],
      ["(4 - 5)", -1],
      ["(4 * 5)", 20],
      ["(4 / 5)", 4 / 5],
      ["(4 % 5)", 4 % 5],
      ["(4 < 5)", true],
      ["(4 <= 5)", true],
      ["(4 > 5)", false],
      ["(4 >= 5)", false],
      ["(true not)", false],
      ["(true and false)", false],
      ["(true or false)", true],
    ];

    examples.forEach(([form, expected]) => {
      test(`${form} => ${prStr(expected)}`, () => {
        const output = subject.evalString(form);
        expect(output).toBe(expected);
      });
    });
  });
});
