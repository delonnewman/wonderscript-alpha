export class PushBackReader {
    private readonly limit: number;
    private readonly stream: string[];
    private position: number;
    private _line: number;
    private _column: number;

    constructor(str) {
        this.limit  = str.length - 1;
        this.stream = str.split('');
        this.position = 0;
        this._line = 0;
        this._column = 0;
    }

    line() {
        return this._line;
    }

    incrementLine() {
        this._line++;
    }

    decrementLine() {
        this._line--;
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
        if (this.position > this.limit) return null;
        const ch = this.stream[this.position];
        this.position++;
        if (ch === '\n') {
            this.resetColumn();
            this.incrementLine();
        }
        else {
            this.incrementColumn();
        }
        return ch;
    }

    skip(n: number) {
        this.position += n;
    }

    reset() {
        this.position = 0;
    }

    unread(ch: string) {
        this.position -= 1;
        this.stream[this.position] = ch;
    }
}

