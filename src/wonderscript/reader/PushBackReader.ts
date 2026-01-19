export class PushBackReader {
  private readonly limit: number;
  private readonly stream: string[];
  #position: number;
  #line: number;
  private _column: number;

  constructor(str: string) {
    this.limit = str.length - 1;
    this.stream = str.split("");
    this.#position = 0;
    this.#line = 1;
    this._column = 0;
  }

  get position(): number {
    return this.#position;
  }

  get line() {
    return this.#line;
  }

  incrementLine() {
    this.#line++;
  }

  decrementLine() {
    this.#line--;
  }

  incrementColumn() {
    this._column++;
  }

  resetColumn() {
    this._column = 0;
  }

  column() {
    return this._column;
  }

  read() {
    if (this.#position > this.limit) return null;

    const ch = this.stream[this.#position];
    this.#position++;

    if (ch === "\n") {
      this.resetColumn();
      this.incrementLine();
    } else {
      this.incrementColumn();
    }

    return ch;
  }

  skip(n: number) {
    this.#position += n;
  }

  reset() {
    this.#position = 0;
  }

  unread(ch: string) {
    this.#position -= 1;
    this.stream[this.#position] = ch;
  }
}
