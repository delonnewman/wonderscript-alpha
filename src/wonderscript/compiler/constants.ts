import {CORE_NS} from "./vars";

export const QUOTE_SYM    = 'quote';
export const DEF_SYM      = 'def';
export const COND_SYM     = 'cond';
export const JS_SYM       = 'js*';
export const FN_SYM       = 'fn*';
export const LOOP_SYM     = 'loop';
export const RECUR_SYM    = 'recur';
export const THROW_SYM    = 'throw';
export const TRY_SYM      = 'try';
export const CATCH_SYM    = 'catch';
export const FINALLY_SYM  = 'finally';
export const DO_SYM       = 'do';
export const LET_SYM      = 'let';
export const DOT_SYM      = '.';
export const DOT_DASH_SYM = '.-';
export const NEW_SYM      = 'new';
export const SET_SYM      = 'set!';
export const NIL_SYM      = 'nil';
export const TRUE_SYM     = 'true';
export const FALSE_SYM    = 'false';

export const KEYWORD_SYM  = 'keyword';

// Operators
export const MOD_SYM         = 'mod';
export const LT_SYM          = '<';
export const GT_SYM          = '>';
export const LTQ_SYM         = '<=';
export const GTQ_SYM         = '>=';
export const NOT_SYM         = 'not';
export const OR_SYM          = 'or';
export const AND_SYM         = 'and';
export const BIT_NOT_SYM     = 'bit-not';
export const BIT_OR_SYM      = 'bit-or';
export const BIT_XOR_SYM     = 'bit-xor';
export const BIT_AND_SYM     = 'bit-and';
export const BIT_LSHIFT_SYM  = 'bit-shift-left';
export const BIT_RSHIFT_SYM  = 'bit-shift-right';
export const BIT_URSHIFT_SYM = 'unsigned-bit-shift-right';
export const IDENTICAL_SYM   = 'identical?';
export const EQUIV_SYM       = 'equiv?';
export const PLUS_SYM        = '+';
export const MINUS_SYM       = '-';
export const DIV_SYM         = '/';
export const MULT_SYM        = '*';
export const AGET_SYM        = 'aget';
export const ASET_SYM        = 'aset';
export const ALENGTH_SYM     = 'alength';
export const INSTANCE_SYM    = 'instance?';
export const TYPE_SYM        = 'type';

export const NULL_SYM        = 'null';
export const UNDEFINED_SYM   = 'undefined';
export const EMPTY_ARRAY     = '[]';

export const JS_OR          = '||';
export const JS_AND         = '&&';
export const JS_NOT         = '!';
export const JS_BIT_OR      = '|';
export const JS_BIT_AND     = '&';
export const JS_BIT_NOT     = '~';
export const JS_BIT_XOR     = '^';
export const JS_BIT_RSHIFT  = '>>';
export const JS_BIT_URSHIFT = '>>>';
export const JS_BIT_LSHIFT  = '<<';
export const JS_IDENTICAL   = '===';
export const JS_EQUIV       = '==';
export const JS_INSTANCE    = ' instance ';
export const JS_TYPEOF      = 'typeof'
export const JS_MOD         = '%';
export const JS_LT          = '<';
export const JS_GT          = '>';
export const JS_LTQ         = '<=';
export const JS_GTQ         = '>=';
export const OPEN_PEREN     = '(';
export const CLOSE_PEREN    = ')';

export const RECURSION_POINT_CLASS = `${CORE_NS.name}.RecursionPoint`;

export const SPECIAL_FORMS = {
    quote: true,
    def:   true,
    cond:  true,
    'js*': true,
    'fn*': true,
    loop: true,
    recur: true,
    throw: true,
    try: true,
    catch: true,
    finally: true,
    do: true,
    let: true,
    '.': true,
    new: true,
    'set!': true
} as const;

export const CORE_NAMES = {
    'eq'    : '=',
    'noteq' : 'not=',
    'lt'    : '<',
    'gt'    : '>',
    'lteq'  : '<=',
    'gteq'  : '>=',
    'add'   : '+',
    'sub'   : '-',
    'mult'  : '*',
    'div'   : '/'
} as const;
