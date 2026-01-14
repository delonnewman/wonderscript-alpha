import { expect, test, describe } from "bun:test";

import { Compiler } from "../../src/wonderscript";

describe("Compiler", () => {
    const subject = new Compiler("node", global);

    test("slot access", () => {
        let output = subject.evalString('(slot js/global "hey")');
        expect(output).toBeUndefined();

        subject.evalString('(slot-set! js/global "hey" "You")');
        output = subject.evalString('(slot js/global "hey")');

        expect(output).toBe("You");
    });

    describe("evalString", () => { });
});
