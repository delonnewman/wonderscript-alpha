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
import {varReader} from "./varReader";
import {setReader} from "./setReader";

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
    "'": wrappingReader('quote'),
    '@': wrappingReader('deref'),
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
    "'": varReader,
    '{': setReader
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
    var m = MACROS[ch];
    if (m != null) return m;
    return null;
}

export function matchSymbol(s: string): string | ['keyword', string] {
    if (s.charAt(0) === ':') {
        //return Keyword.intern(Sym.intern(s.substring(1)));
        return ['keyword', s.slice(1)];
    }
    //return Sym.intern(s);
    return s;
}

export function interpretToken(s: string) {
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
