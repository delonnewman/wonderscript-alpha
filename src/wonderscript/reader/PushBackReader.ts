const INIT_LINE = 1;
const INIT_COL  = 0;
const INIT_POS  = 0;

export class PushBackReader {
  #limit: number;
  #stream: string[];

  #position: number;
  #line: number;
  #column: number;

  constructor(str: string) {
    this.#limit = str.length - 1;
    this.#stream = str.split("");
    this.reset();
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
      this.#column = INIT_COL;
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
    this.#position = INIT_POS;
    this.#column = INIT_COL;
    this.#line = INIT_LINE;
  }

  unread(ch: string) {
    this.#position -= 1;
    this.#stream[this.#position] = ch;

    this.#column = this.#position;
    if (ch === "\n") {
      this.#line--;
    }
  }
}
