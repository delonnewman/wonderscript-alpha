export class PushBackReader {
  #limit: number;
  #stream: string[];

  #position: number;
  #line: number;
  #column: number;

  constructor(str: string) {
    this.#limit = str.length - 1;
    this.#stream = str.split("");
    this.#position = 0;
    this.#line = 1;
    this.#column = 0;
  }

  get position(): number {
    return this.#position;
  }

  get line() {
    return this.#line;
  }

  get column() {
    return this.#column;
  }

  read() {
    if (this.#position > this.#limit) {
      return null;
    }

    const ch = this.#stream[this.#position];
    this.#position++;

    if (ch === "\n") {
      this.#column = 0;
      this.#line++;
    } else {
      this.#column++;
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
    this.#stream[this.#position] = ch;
  }
}
