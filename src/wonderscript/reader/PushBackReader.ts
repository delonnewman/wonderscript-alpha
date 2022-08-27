export class PushBackReader {
    private limit: number;
    private stream: any;
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
        var ch = this.stream[this.position];
        this.position++;
        //console.log(JSON.stringify(ch));
        if (ch === '\n') {
            //console.log('line:', this.line());
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

