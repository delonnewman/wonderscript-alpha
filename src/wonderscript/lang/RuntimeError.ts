export type Stacktrace = string[];

export class RuntimeError extends Error {
  readonly stacktrace: Stacktrace;

  constructor(message: string, stacktrace: Stacktrace) {
    super(message);
    this.stacktrace = stacktrace;
    this.stack = `${this.stacktraceString()}\n${super.stack}`;
  }

  stacktraceString(): string {
    const stack = this.stacktrace;
    const buffer = [];

    for (let i = 0; i < stack.length; i++) {
      const frame = stack[i];
      buffer.push(`${frame[0]} - ${frame[1]}:${frame[2]}`);
    }

    return buffer.join("\n");
  }
}
