import { StackFrame } from "./StackFrame";

export class StackTrace {
  readonly frames: Readonly<StackFrame[]>;

  static empty(): StackTrace {
    return new StackTrace([]);
  }

  constructor(frames: StackFrame[]) {
    this.frames = frames;
  }

  toString() {
    return this.frames.join("\n");
  }

  toArray() {
    return this.frames.map((f) => f.toString());
  }
}
