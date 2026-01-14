import { expect, test, describe } from "bun:test";
import {
  escapeChars,
  isInternable,
} from "../../../src/wonderscript/compiler/utils";

describe("Compiler Utils", () => {
  describe("isInternable", () => {
    const examples = [
      { value: "aName", valid: true },
      { value: "a_name", valid: true },
      { value: "a$name", valid: true },
      { value: "x123", valid: true },
      { value: "x", valid: true },
      { value: "$", valid: true },
      { value: "_", valid: true },
      { value: "a-name", valid: false },
      { value: "1x", valid: false },
      { value: "a@name", valid: false },
      { value: "a/name", valid: false },
      { value: "", valid: false },
    ];

    examples.forEach((example) => {
      const { value, valid } = example;
      test(`"${value}" => ${valid}`, () => {
        expect(isInternable(value)).toBe(valid);
      });
    });
  });

  describe("escapeChars", () => {
    const examples = [
      { in: "aName", out: "aName" },
      { in: "a_name", out: "a_name" },
      { in: "a$name", out: "a$name" },
      { in: "x123", out: "x123" },
      { in: "x", out: "x" },
      { in: "$", out: "$" },
      { in: "_", out: "_" },
      { in: "a-name", out: "a_DASH_name" },
      { in: "a@name", out: "a_AT_name" },
      { in: "a/name", out: "a_BSLASH_name" },
    ];

    examples.forEach((example) => {
      test(`"${example.in}" => "${example.out}"`, () => {
        expect(escapeChars(example.in)).toEqual(example.out);
      });
    });
  });
});
