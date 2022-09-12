import {stringReader} from "./stringReader";
import {commentReader} from "./commentReader";
import {listReader} from "./listReader";
import {unmatchedDelimiterReader} from "./unmatchedDelimiterReader";
import {vectorReader} from "./vectorReader";
import {mapReader} from "./mapReader";
import {characterReader} from "./characterReader";
import {metaReader} from "./metaReader";
import {wrappingReader} from "./wrappingReader";
import {dispatchReader} from "./dispatchReader";
import {defReader} from "./defReader";
import {setReader} from "./setReader";
import {Symbol} from "../lang/Symbol";
import {Keyword} from "../lang/Keyword";
import {fnReader} from "./fnReader";

export const LINE_KEY   = Keyword.intern("line");
export const COLUMN_KEY = Keyword.intern("column");
export const TAG_KEY    = Keyword.intern("tag");

export function isWhitespace(ch): boolean {
    if (ch == null) return false;

    return ch === ',' || ch.match(/^\s$/);
}

export function isDigit(ch): boolean {
    return ch && ch.match(/^\d$/);
}

export const MACROS = {
    '"': stringReader,
    ';': commentReader,
    "'": wrappingReader(Symbol.intern('quote')),
    '@': wrappingReader(Symbol.intern('deref')),
    '^': metaReader,
    '(': listReader,
    ')': unmatchedDelimiterReader,
    '[': vectorReader,
    ']': unmatchedDelimiterReader,
    '{': mapReader,
    '}': unmatchedDelimiterReader,
    '\\': characterReader,
    '#': dispatchReader
} as const;

// TODO: implement dispatch macros
export const DISPATCH_MACROS = {
    '^': metaReader,
    "'": defReader,
    '{': setReader,
    '(': fnReader,
} as const;

export function isMacro(ch): boolean {
    return !!MACROS[ch];
}

export function isTerminatingMacro(ch): boolean {
    return (ch !== '#' && ch !== '\'' && isMacro(ch));
}

export function nonConstituent(ch): ch is '@' | '`' | '~' {
    return ch === '@' || ch === '`' || ch === '~';
}

export function getMacro(ch: string): Function | null {
    const m = MACROS[ch];
    if (m != null) return m;

    return null;
}

export function matchSymbol(s: string): Symbol | Keyword {
    if (s.charAt(0) === ':') {
        return Keyword.parse(s);
    }
    return Symbol.parse(s);
}

export function interpretToken(s: string): null | boolean | Symbol | Keyword {
    if (s === 'nil') {
        return null;
    }
    if (s === 'true') {
        return true;
    }
    if (s === 'false') {
        return false;
    }

    const ret = matchSymbol(s);
    if (ret !== null) return ret;

    throw new Error('Invalid token: ' + s);
}
