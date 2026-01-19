import { expect, it, describe } from "bun:test";
import { PushBackReader } from "../../../src/wonderscript/reader/PushBackReader";

describe("PushBackReader", () => {
  it("reads one character at a time", () => {
    const reader = new PushBackReader("testing");

    const chars: unknown[] = [];
    chars.push(reader.read());
    chars.push(reader.read());

    expect(chars).toEqual(["t", "e"]);
  });

  it("keeps track of it's position", () => {
    const reader = new PushBackReader("testing");

    reader.read();
    reader.read();

    expect(reader.position).toBe(2);
  });

  describe("line counting", () => {
    const reader = new PushBackReader("a\nb\nc");

    it("starts at 1", () => {
      expect(reader.line).toBe(1);
    });

    it("doesn't increment with each read", () => {
      reader.read();

      expect(reader.line).toBe(1);
    });

    it("does increment when it reads a newline character", () => {
      reader.read();

      expect(reader.line).toBe(2);
    });

    it("counts each newline character", () => {
      reader.read();
      reader.read();

      expect(reader.line).toBe(3);
    });
  });

  describe("column counting", () => {
    const reader = new PushBackReader("(+ 1 2)\n(* 3 4)\n(/ 4 5)");

    it("starts at 0", () => {
      expect(reader.column).toBe(0);
    });

    it("increments with each read", () => {
      reader.read();
      reader.read();

      expect(reader.column).toBe(2);
    });

    it("gets reset when a newline character is read", () => {
      reader.read();
      reader.read();
      reader.read();
      reader.read();
      reader.read();
      reader.read();

      expect(reader.column).toBe(0);
    });
  });
});
