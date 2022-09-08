import {isString} from "../lang/runtime";

const names = {
    '=': 'eq',
    'not=': 'noteq',
    '<': 'lt',
    '>': 'gt',
    '<=': 'lteq',
    '>=': 'gteq',
    '+': 'add',
    '-': 'sub',
    '*': 'mult',
    '/': 'div'
} as const;

export function capitalize(x: string): string {
    if (x.length === 0) return x;
    return `${x[0].toUpperCase()}${x.slice(1)}`;
}

const DASH = '-';
const UNDERSCORE = '_';

export function dasherize(string: string): string {
    var i, ch, buffer = [];

    for (i = 0; i < string.length; i++) {
        ch = string[i];
        if (ch.match(/[A-Z]/)) { // TODO: replace this with a numerical method
            buffer.push(DASH);
            buffer.push(ch.toLowerCase());
        }
        else if (ch === UNDERSCORE) {
            buffer.push(DASH);
        }
        else {
            buffer.push(ch);
        }
    }

    return buffer.join('');
}

export function wsNameToJS(x: string): string {
    if (names[x]) {
        return names[x];
    }

    var prefix = null, parts;

    if (x.endsWith('?')) {
        prefix = 'is';
        x = x.slice(0, x.length - 1);
    }
    else if (x.endsWith('!')) {
        x = x.slice(0, x.length - 1);
    }
    else if (x.startsWith('*') && x.endsWith('*')) {
        return x
            .slice(0, x.length - 1)
            .slice(1)
            .split('-')
            .map((s) => s.toUpperCase())
            .join('_');
    }

    if (x.indexOf("->") !== -1) {
        parts = x
            .split("->")
            .reduce((a, x) => `${a} to ${x}`);
    }
    else {
        parts = prefix ? [].concat(prefix, x.split('-')) : x.split('-');
    }

    return [].concat(parts[0], parts.slice(1).map(capitalize)).join('');
}

const SPECIAL_CHARS = {
    '='    : '_EQ_',
    '\\-'  : '_DASH_',
    '\\*'  : '_STAR_',
    '!'    : '_BANG_',
    '\\?'  : '_QUEST_',
    '\\^'  : '_HAT_',
    '\\+'  : '_PLUS_',
    '\\.'  : '_DOT_',
    '/'    : '_BSLASH_',
    '\\\\' : '_FSLASH_',
    '>'    : '_GT_',
    '<'    : '_LT_',
    '\\['  : '_OBRACK_',
    '\\]'  : '_CBRACK_',
    '\\$'  : '_DOLLAR_',
    '\\@'  : '_AT_',
    '\\%'  : '_PERCENT_',
    '~'    : '_TILDE_',
} as const;

export function escapeChars(str: string): string {
    if (!isString(str)) throw new Error("only strings can be escaped not " + JSON.stringify(str))

    for (let ch in SPECIAL_CHARS) {
        str = str.replace(new RegExp(ch, 'g'), SPECIAL_CHARS[ch]);
    }

    return str;
}

const UNESCAPE_MAPPING = {
    _EQ_: '=',
    _DASH_: '-',
    _STAR_: '*',
    _BANG_: '!',
    _QUEST_: '?',
    _HAT_: '^',
    _PLUS_: '+',
    _DOT_: '.',
    _BSLASH_: '/',
    _FSLASH_: '\\',
    _GT_: '>',
    _LT_: '<',
    _OBRACK_: '[',
    _CBRACK_: ']',
    _DOLLAR_: '$',
    _AT_: '@',
    _PERCENT_: '%',
    _TILDE_: '~',
} as const;

export function unescapeChars(str: string): string {
    for (let entry in Object.entries(UNESCAPE_MAPPING)) {
        str = str.replace(new RegExp(entry[0], 'g'), entry[1]);
    }
    return str;
}
