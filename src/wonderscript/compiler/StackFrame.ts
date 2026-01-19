export class StackFrame {
  readonly file: string;
  readonly line: number;
  readonly column: number;

  constructor(file: string, line: number, column: number) {
    this.file = file;
    this.line = line;
    this.column = column;
  }

  toString() {
    return `    at ${this.file}:${this.line}:${this.column}`;
  }
}
