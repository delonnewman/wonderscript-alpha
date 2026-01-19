import { expect, test, describe } from "bun:test";
import { StackFrame } from "../../../src/wonderscript/compiler/StackFrame";

describe("StackFrame", () => {
  const file = "test.ws";
  const line = 341;
  const column = 7;
  const frame = new StackFrame(file, line, column);

  test("#file", () => {
    expect(frame.file).toBe(file);
  });

  test("#line", () => {
    expect(frame.line).toBe(line);
  });

  test("#column", () => {
    expect(frame.column).toBe(column);
  });

  test("#toString", () => {
    expect(frame.toString()).toBe(`    at ${file}:${line}:${column}`);
  });
});
