import { expect, test, describe } from "bun:test";
import { isInternable } from "../../../src/wonderscript/compiler/utils";

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
});
