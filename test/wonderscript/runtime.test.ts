import { expect, test, describe } from "bun:test";
import { partition } from "../../src/wonderscript/lang/runtime";

describe("Runtime functions", () => {
  describe("partition", () => {
    test("[] => []", () => {
      expect(partition(2, [])).toEqual([]);
    });

    test("[a, b] => [[a, b]]", () => {
      expect(partition(2, [1, 2])).toEqual([[1, 2]]);
    });

    test("[a, b, c, d] => [[a, b], [c, d]]", () => {
      expect(partition(2, [1, 2, 3, 4])).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });

    test("[a, b, c] => [[a, b, c]]", () => {
      expect(partition(3, [1, 2, 3])).toEqual([[1, 2, 3]]);
    });

    test("[a, b, c, d, e, f] => [[a, b, c], [d, e, f]]", () => {
      expect(partition(3, [1, 2, 3, 4, 5, 6])).toEqual([
        [1, 2, 3],
        [4, 5, 6],
      ]);
    });

    test("[a, b, c] => [[a, b], [c, undefined]]", () => {
      expect(partition(2, [1, 2, 3])).toEqual([
        [1, 2],
        [3, undefined],
      ]);
    });
  });
});
