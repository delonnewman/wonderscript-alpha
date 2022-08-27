import {PushBackReader} from "./PushBackReader";

export function unmatchedDelimiterReader(r: PushBackReader, delim: string, opts) {
    throw new Error('Unmatched delimiter: ' + delim);
}

