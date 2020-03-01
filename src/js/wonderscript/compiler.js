// jshint esversion: 6
// jshint eqnull: true
const GLOBAL = typeof module !== 'undefined' ? global : window;
GLOBAL.wonderscript = GLOBAL.wonderscript || {};
GLOBAL.wonderscript.compiler = function() {
    const IS_NODE = typeof module !== 'undefined' ? true : false;
    const IS_BROWSER = typeof window !== 'undefined' ? true : false;

    var GLOBAL, core, edn;
    if (IS_NODE) {
        core = require('./core.js');
        edn = require('./edn.js');
        GLOBAL = global;
    }

    if (IS_BROWSER) {
        core = wonderscript.core;
        edn = wonderscript.edn;
        GLOBAL = window;
    }

    const {
        str,
        map,
        reduce,
        partition,
        cons,
        first,
        next,
        rest,
        isObject,
        isObjectLiteral,
        isNull,
        isString,
        isFunction,
        isNumber,
        isBoolean,
        isUndefined,
        isArray,
        isArrayLike,
        print,
        isEmpty
    } = core;

    const { read, PushBackReader } = edn;

    const QUOTE_SYM   = 'quote';
    const DEF_SYM     = 'def';
    const COND_SYM    = 'cond';
    const JS_SYM      = 'js';
    const FN_SYM      = 'fn*';
    const LOOP_SYM    = 'loop';
    const RECUR_SYM   = 'recur';
    const THROW_SYM   = 'throw';
    const TRY_SYM     = 'try';
    const CATCH_SYM   = 'catch';
    const FINALLY_SYM = 'finally';
    const DO_SYM      = 'do';
    const LET_SYM     = 'let';
    const DOT_SYM     = '.';
    const NEW_SYM     = 'new';
    const SET_SYM     = 'set!';
    const NIL_SYM     = 'nil';
    const TRUE_SYM    = 'true';
    const FALSE_SYM   = 'false';
    
    // Operators
    const MOD_SYM         = 'mod';
    const LT_SYM          = '<';
    const GT_SYM          = '>';
    const LTQ_SYM         = '<=';
    const GTQ_SYM         = '>=';
    const NOT_SYM         = 'not';
    const OR_SYM          = 'or';
    const AND_SYM         = 'and';
    const BIT_NOT_SYM     = 'bit-not';
    const BIT_OR_SYM      = 'bit-or';
    const BIT_XOR_SYM     = 'bit-xor';
    const BIT_AND_SYM     = 'bit-and';
    const BIT_LSHIFT_SYM  = 'bit-shift-left';
    const BIT_RSHIFT_SYM  = 'bit-shift-right';
    const BIT_URSHIFT_SYM = 'unsigned-bit-shift-right';
    const IDENTICAL_SYM   = 'identical?';
    const EQUIV_SYM       = 'equiv?';
    const PLUS_SYM        = '+';
    const MINUS_SYM       = '-';
    const DIV_SYM         = '/';
    const MULT_SYM        = '*';
    const AGET_SYM        = 'aget';
    const ASET_SYM        = 'aset';
    const ALENGTH_SYM     = 'alength';

    const MACRO_DEF_SYM   = 'defmacro';

    const SPECIAL_FORMS = {
        quote: true,
        def: true,
        cond: true,
        js: true,
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
    };

    const CORE_MOD = {};
    const CORE_NS = {name: 'wonderscript.core', module: CORE_MOD};
    const CURRENT_NS = {
        value: CORE_NS
    };

    const RECURSION_POINT_CLASS = str(CORE_NS.name, '.RecursionPoint');

    function RecursionPoint(args) {
        this.args = args;
    }

    const RECUR_ERROR = new Error('recur can only be used in a tail position within a loop or function');

    var names = {
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
    };

    function cap(x) {
        if (x.length === 0) return x;
        return str(x[0].toUpperCase(), x.slice(1));
    }

    function wsNameToJS(x) {
        if (names[x]) return names[x];
        var prefix = null, parts;
        if (x.endsWith('?')) {
            prefix = 'is';
            x = x.slice(0, x.length - 1);
        }
        else if (x.endsWith('!')) {
            x = x.slice(0, x.length - 1);
        }
        else if (x.startsWith('*') && x.endsWith('*')) {
            return x.slice(0, x.length - 1).slice(1).split('-').map(function(s) { return s.toUpperCase(); }).join('_');
        }
        if (x.indexOf("->") !== -1) parts = x.split("->").reduce(function(a, x) { return [].concat(a, "to", x); });
        else parts = prefix ? [].concat(prefix, x.split('-')) : x.split('-');
        return [].concat(parts[0], parts.slice(1).map(cap)).join('');
    }

    const SPECIAL_CHARS = {
        '=': '_EQ_',
        '\\-': '_DASH_',
        '\\*': '_STAR_',
        '!': '_BANG_',
        '\\?': '_QUEST_'
    };

    function escapeChars(string) {
        /*if (string.indexOf('.') !== -1) throw new Error('"."s are reserved for namespaces');
        var ch;
        for (ch in SPECIAL_CHARS) {
            string = string.replace(new RegExp(ch, 'g'), SPECIAL_CHARS[ch]);
        }
        return string;*/
        return wsNameToJS(string);
    }

    function env(parent) {
        if (parent) {
            return {
                vars: {},
                parent: parent
            };
        } else {
            return {
                vars: {},
                parent: null
            };
        }
    }

    function lookup(env, name) {
        if (env == null) {
            p('env null');
            return null;
        }
        else if (env.vars != null && env.vars[name] != null) {
            return env;
        }
        else {
            if (env.parent == null) {
                return null;
            }
            else {
                var scope = env.parent;
                while (scope != null) {
                    if (scope.vars != null && scope.vars[name] != null) {
                        return scope;
                    }
                    scope = scope.parent;
                }
                return null;
            }
        }
    }

    function define(env, name, value) {
        if (typeof value !== 'undefined') {
            env.vars[name] = value;
            return null;
        }
        else {
            env.vars[name] = null;
            return null;
        }
    }

    function findLexicalVar(env, name) {
        var scope = lookup(env, name);
        if (scope == null) {
            throw new Error(str('Undefined variable: "', name, '"'));
        }
        else {
            return scope.vars[name];
        }
    }

    function findNamespaceVar(s) {
        if (s.indexOf('/') !== -1) {
            var parts = s.split('/');
            if (parts[1].indexOf('.') !== -1) throw new Error('"." are reserved for namespaces');
            if (parts.length !== 2) throw new Error('A symbol should only have 2 parts');
            var scope = lookup(env, parts[0]);
            if (scope === null) return null;
            else {
                var ns = scope.vars[parts[0]],
                    val = ns.module[parts[1]];
                if (isUndefined(val)) return null;
                return val;
            }
        }
        else {
            var s = escapeChars(s),
                val = CURRENT_NS.value.module[s];
            if (!isUndefined(val)) {
                return val;
            }
            else if (!isUndefined(val = CORE_NS.module[s])) {
                return val;
            }
            return null;
        }
    }

    function isMacro(x) {
        return isFunction(x) && x.$ws$macro === true;
    }

    function macroexpand(form) {
        if (!isArray(form)) {
            return form;
        }
        else {
            if (SPECIAL_FORMS[form[0]]) return form;
            else if (isString(form[0])) {
                var val = findNamespaceVar(form[0]);
                if (val === null) return form;
                else {
                    if (isMacro(val)) {
                        return macroexpand(val.apply(null, form.slice(1)));
                    }
                    else {
                        return form;
                    }
                }
            }
            else {
                return form;
            }
        }
    }

    const TOP = env();
    // TODO: try/catch/finally
    function emit(form_, env_) {
        var env_ = env_ || TOP,
            form = macroexpand(form_);
        if (isString(form)) {
            if (form === 'nil') return 'null';
            return emitSymbol(form, env_);
        }
        else if (isNumber(form)) return str(form);
        else if (isBoolean(form)) return form === true ? TRUE_SYM : FALSE_SYM;
        else if (isNull(form)) return 'null';
        else if (isUndefined(form)) {
            return 'undefined';
        }
        else if (isObjectLiteral(form)) {
            return str('({', map(function(xs) { return str(xs[0], ':', emit(xs[1], env_)); }, Object.entries(form)).join(', '), '})');
        }
        else if (isArray(form)) {
            if (form.length === 0) return '[]';
            else if (isString(form[0])) {
                switch(form[0]) {
                  case DEF_SYM:
                    return emitDef(form, env_);
                  case QUOTE_SYM:
                    return emitQuote(form, env_);
                  case COND_SYM:
                    return emitCond(form, env_);
                  case JS_SYM:
                    return form[1];
                  case FN_SYM:
                    return emitFunc(form, env_);
                  case LOOP_SYM:
                    return emitLoop(form, env_);
                  case RECUR_SYM:
                    throw RECUR_ERROR;
                  case THROW_SYM:
                    return emitThrownException(form, env_);
                  case TRY_SYM:
                    throw new Error("not implemented");
                  case DO_SYM:
                    return emitDo(form, env_);
                  case LET_SYM:
                    return emitLet(form, env_);
                  case DOT_SYM:
                    return emitObjectRes(form, env_);
                  case NEW_SYM:
                    return emitClassInit(form, env_);
                  case SET_SYM:
                    return emitAssignment(form, env_);
                  // operators
                  case MOD_SYM:
                    return str('(', emit(form[1], env_), '%', emit(form[2], env_), ')');
                  case LT_SYM:
                    return str('(', emit(form[1], env_), '<', emit(form[2], env_), ')');
                  case GT_SYM:
                    return str('(', emit(form[1], env_), '>', emit(form[2], env_), ')');
                  case LTQ_SYM:
                    return str('(', emit(form[1], env_), '<=', emit(form[2], env_), ')');
                  case GTQ_SYM:
                    return str('(', emit(form[1], env_), '>=', emit(form[2], env_), ')');
                  case NOT_SYM:
                    return str('!(', emit(form[1], env_), ')');
                  case OR_SYM:
                    return emitBinOperator(['||'].concat(form.slice(1)), env_);
                  case AND_SYM:
                    return emitBinOperator(['&&'].concat(form.slice(1)), env_);
                  case BIT_NOT_SYM:
                    return str('~(', emit(form[1], env_), ')');
                  case BIT_OR_SYM:
                    return emitBinOperator(['|'].concat(form.slice(1)), env_);
                  case BIT_XOR_SYM:
                    return emitBinOperator(['^'].concat(form.slice(1)), env_);
                  case BIT_AND_SYM:
                    return emitBinOperator(['&'].concat(form.slice(1)), env_);
                  case BIT_LSHIFT_SYM:
                    return emitBinOperator(['<<'].concat(form.slice(1)), env_);
                  case BIT_RSHIFT_SYM:
                    return emitBinOperator(['>>'].concat(form.slice(1)), env_);
                  case BIT_URSHIFT_SYM:
                    return emitBinOperator(['>>>'].concat(form.slice(1)), env_);
                  case IDENTICAL_SYM:
                    return emitBinOperator(['==='].concat(form.slice(1)), env_);
                  case EQUIV_SYM:
                    return emitBinOperator(['=='].concat(form.slice(1)), env_);
                  case PLUS_SYM:
                  case MINUS_SYM:
                  case DIV_SYM:
                  case MULT_SYM:
                    return emitBinOperator(form, env_);
                  case AGET_SYM:
                    return emitArrayAccess(form, env_);
                  case ASET_SYM:
                    return emitArrayMutation(form, env_);
                  case ALENGTH_SYM:
                    return emitArrayLength(form, env_);
                  default:
                    return emitFuncApplication(form, env_);
                }
            }
            else {
                return emitFuncApplication(form, env_);
            }
        }
        else {
            throw new Error("Invalid form: " + form);
        }
    }

    function emitArrayAccess(form, env) {
        if (form.length !== 3)
            throw new Error(str('Wrong number of arguments expected 2, got ', form.length));

        return str(emit(form[1], env), '[', emit(form[2], env), ']');
    }

    function emitArrayMutation(form, env) {
        if (form.length !== 4)
            throw new Error(str('Wrong number of arguments expected 3, got ', form.length));

        return str(emit(form[1], env), '[', emit(form[2], env), ']=', emit(form[3], env));
    }

    function emitArrayLength(form, env) {
        if (form.length !== 2)
            throw new Error(str('Wrong number of arguments expected 1, got ', form.length));

        return str(emit(form[1], env), '.length');
    }

    function emitQuote(form) {
        if (form.length !== 2) throw new Error('One value should be quoted');
        return emitQuotedValue(form[1]);
    }

    function emitQuotedValue(val) {
        if (isString(val)) {
            return JSON.stringify(val);
        }
        else if (isNumber(val)) {
            return str(val);
        }
        else if (val === true) return 'true';
        else if (val === false) return 'false';
        else if (val === null) return 'null';
        else if (isUndefined(val)) return 'undefined';
        else if (isArray(val)) {
            return str('[', map(emitQuotedValue, val).join(', '), ']');
        }
        else if (isObjectLiteral(val)) {
            return str('({', map(function(xs) { return str(xs[0], ':', emitQuotedValue(xs[1])); }, Object.entries(val)).join(', '), '})');
        }
        throw new Error('Invalid form: ' + val);
    }

    function emitSymbol(s, env) {
        if (s.indexOf('/') !== -1) {
            var parts = s.split('/');
            if (parts[1].indexOf('.') !== -1) throw new Error('"." are reserved for namespaces');
            if (parts.length !== 2) throw new Error('A symbol should only have 2 parts');
            var scope = lookup(env, parts[0]);
            if (scope === null) throw new Error('Unknown namespace: ' + parts[0]);
            else {
                var ns = scope.vars[parts[0]];
                if (isUndefined(ns.module[parts[1]])) {
                    throw new Error('Undefined variable: ' + parts[1] + ' in namespace: ' + parts[0]);
                }
                return str(ns.name, '.', escapeChars(parts[1]));
            }
        }
        else {
            var s = escapeChars(s);
            if (!isUndefined(CURRENT_NS.value.module[s])) {
                return str(CURRENT_NS.value.name, '.', s);
            }
            else if (!isUndefined(CORE_NS.module[s])) {
                return str(CORE_NS.name, '.', s);
            }
            else {
                findLexicalVar(env, s); // throws error if undefined
                return s;
            }
        }
    }

    function emitRecursionPoint(form, env) {
        return str("throw new ", RECURSION_POINT_CLASS, "([",
            form.slice(1).map(function(x) { return emit(x, env); }).join(', '), "])");
    }

    function emitThrownException(form, env) {
        if (form.length !== 2)
            throw new Error(str('Wrong number of arguments should have 2, got', form.length));
        return str("throw ", emit(form[1], env));
    }

    function isRecur(x) {
        return isArray(x) && x[0] === RECUR_SYM;
    }

    function isThrow(x) {
        return isArray(x) && x[0] === THROW_SYM;
    }
    
    function emitTailPosition(x, env, def, isRecursive) {
        var def_ = def || 'return';
        if (isRecur(x)) {
            if (!isRecursive) throw RECUR_ERROR;
            return emitRecursionPoint(x, env);
        }
        else if (isThrow(x)) {
            return emitThrownException(x, env);
        }
        else {
            return str(def_, ' ', emit(x, env));
        }
    }

    function emitCond(form, env) {
        var i, cond, x,
            exprs = partition(2, rest(form)),
            buff = [];
        for (i = 0; i < exprs.length; ++i) {
            cond = i === 0 ? 'if' : 'else if';
            if ( exprs[i][0] === 'else' ) {
                buff.push(str('else { ', emitTailPosition(exprs[i][1], env), ' }')); 
            }
            else {
                x = emit(exprs[i][0], env);
                buff.push(str(cond, '(', x, ' != null && ', x, ' !== false){ ', emitTailPosition(exprs[i][1], env), ' }')); 
            }
        }
        return str('(function(){ ', buff.join(' '), '}())');
    }

    function compileBody(body, env, tailDef, isRecursive) {
        var last = body[body.length - 1],
            head = body.slice(0, body.length - 1);
        return map(function(x) { return emit(x, env); }, head)
                .concat(emitTailPosition(last, env, tailDef, isRecursive)).join('; ');
    }

    function compileRecursiveBody(body, names, env) {
        var i, rebinds, buff = [];
        for (i = 0; i < names.length; i++) {
            buff.push(str(names[i], ' = e.args[', i, ']'));
        }
        rebinds = buff.join('; ');
        return str(
            "var retval;\nloop:\n\twhile (true) { try { ",
            compileBody(body, env, 'retval =', true),
            "; break loop; } catch (e) { if (e instanceof ", RECURSION_POINT_CLASS,
            ") { ", rebinds, "; continue loop; } else { throw e; } } };\nreturn retval"
        );
    }

    function emitLoop(form, env) {
        if (form.length < 3) throw new Error('A loop expression should have at least 3 elements');
        var i, bind,
            buff = ['(function('],
            rest = form.slice(1),
            binds = rest[0],
            body = rest.slice(1);

        // add names to function scope
        var names = [];
        for (i = 0; i < binds.length; i += 2) {
            bind = binds[i];
            if (!isString(bind)) throw new Error('Invalid binding name');
            names.push(bind);
        }
        buff.push(names.join(', '));
        buff.push('){');

        // body
        buff.push(compileRecursiveBody(body, names, env));
        buff.push('}(');

        // add values to function scope
        var values = [];
        for (i = 0; i < binds.length; i += 2) {
            values.push(emit(binds[i + 1], env));
        }
        buff.push(values.join(', '));
        buff.push('))');

        return buff.join('');
    }
  
    function emitLet(form, env_) {
        var env_ = env(env_);
        if (form.length < 3) throw new Error('A let expression should have at least 3 elements');
        var i, bind,
            buff = ['(function('],
            rest = form.slice(1),
            binds = rest[0],
            body = rest.slice(1);

        // add names to function scope
        var names = [];
        for (i = 0; i < binds.length; i += 2) {
            bind = binds[i];
            if (!isString(bind)) throw new Error('Invalid binding name');
            define(env_, bind, true);
            names.push(bind);
        }
        buff.push(names.join(', '));
        buff.push('){');

        // body
        buff.push(compileBody(body, env_));
        buff.push('}(');

        // add values to function scope
        var values = [];
        for (i = 0; i < binds.length; i += 2) {
            values.push(emit(binds[i + 1], env));
        }
        buff.push(values.join(', '));
        buff.push('))');

        return buff.join('');
    }

    function emitDef(form, env, opts) {
        var name = escapeChars(form[1]), code, value, def;
        if (form[2]) {
            code = emit(form[2], env); value = eval(code);
            def = str(CURRENT_NS.value.name, ".", name, " = ", code, ";");
        }
        else {
            code = 'null'; value = null;
            def = str(CURRENT_NS.value.name, ".", name, " = null;");
        }
        CURRENT_NS.value.module[name] = value;
        return def;
    }
  
    function emitAssignment(form, env) {
        if (form.length !== 3) throw new Error('set! should have 3 and only 3 elements');
        return str(emit(form[1], env), " = ", emit(form[2], env));
    }
  
    function parseArgs(args) {
      var splat = false, name, argsBuf = [];
      for (var i = 0; i < args.length; ++i) {
        if ( /^&/.test(args[i]) ) {
          name = args[i].replace(/^&/, '');
          splat = true;
        }
        else {
          name = args[i];
        }
        argsBuf.push({name: name, order: i, splat: splat});
      }
      return argsBuf;
    }
  
    function genArgAssigns(argsBuf) {
      var argsAssign = [], i;
      for (i = 0; i < argsBuf.length; ++i) {
        if (argsBuf[i].splat) argsAssign.push(str('var ', argsBuf[i].name, " = Array.prototype.slice.call(arguments, ", i, ")"));
      }
      return argsAssign.join('');
    }
  
    function genArgsDef(argsBuf) {
      var i, argsDef = [];
      for (i = 0; i < argsBuf.length; ++i) {
        argsDef.push(argsBuf[i].name);
      }
      return argsDef.join(',');
    }
  
    function emitFunc(form, env_, opts) {
        var env_ = env(env_),
            args = form[1],
            argsDef, argsAssign, argsBuf, expr, i, value;
  
        if (form.length < 3) throw new Error("a function requires at least an arguments list and a body");
        else {
            if (!isArray(args)) throw new Error("an arguments list is required");
  
            argsBuf = parseArgs(args);
            argsAssign = genArgAssigns(argsBuf);
            argsDef = genArgsDef(argsBuf);

            for (i = 0; i < argsBuf.length; i++) {
                define(env_, argsBuf[i].name, true);
            }
    
            var buf = [argsAssign];
            buf.push(compileRecursiveBody(form.slice(2), argsBuf.map(function(x) { return x.name }), env_));
  
            return str("(function(", argsDef, ") { ", buf.join('; '), "; })");
        }
    }
  
    function emitDo(form, env) {
        var exprs = form.slice(0, form.length - 1).slice(1),
            buf = [],
            last = form[form.length - 1];
        for (i = 0; i < exprs.length; ++i) {
            buf.push(emit(exprs[i], env, env));
        }
        buf.push(emitTailPosition(last));
  
        return str("(function(){ ", buf.join('; '), "; }())");
    }
  
    function emitObjectRes(form, env) {
        var obj = form[1], prop = form[2];
        if (isArray(prop)) {
            return str('(', emit(obj, env), ').', escapeChars(prop[0]), '(',
                map(function(x) { return emit(x, env); }, prop.slice(1)).join(', '), ')');
        }
        else if (isString(prop)) {
            if (prop.startsWith('-')) {
                return str('(', emit(obj, env), ').', escapeChars(prop.slice(1)));
            }
            else {
                return str('(', emit(obj, env), ').', escapeChars(prop), '()');
            }
        }
        else {
            throw new Error("'.' form requires at least 3 elements");
        }
    }
  
    function emitClassInit(form, env) {
      var args = map(emit, form.slice(2)).join(', ');
      return str('new ', emit(form[1], env), '(', args, ')');
    }

    function emitFuncApplication(form, env) {
        if (isString(form[0]) && isMacro(findNamespaceVar(form[0])))
            throw new Error('Macros cannot be evaluated in this context');

        var fn = emit(form[0], env),
            args = form.slice(1, form.length),
            argBuffer = [], i, value;
    
        for (i = 0; i < args.length; ++i) {
            value = emit(args[i], env);
            argBuffer.push(value);
        }
    
        if (argBuffer.length === 0) {
            return str('(', fn, ')()');
        }

        return str('(', fn, ')(', argBuffer.join(', ') ,")");
    }
    
    function emitBinOperator(form, env) {
      var op = form[0],
          values = form.slice(1, form.length),
          valBuffer = [], i;
      for (i = 0; i < values.length; ++i) {
        valBuffer.push(emit(values[i], env));
      }
      return str('(', valBuffer.join(op), ')');
    }

    function evaluate(form) {
        return eval(emit(form));
    }

    var EOF = {eof: true};
    function isEOF(x) {
        return x && x.eof === true;
    }

    function evalString(s) {
        var r = new PushBackReader(s);
        var res, ret;
        while (true) {
            res = read(r, {eofIsError: false, eofValue: EOF});
            if (res != null) {
                ret = evaluate(res);
            }
            if (isEOF(res)) return ret;
        }
    }

    function readString(s) {
        var r = new PushBackReader(s);
        var res, ret, seq = [];
        while (true) {
            res = read(r, {eofIsError: false, eofValue: EOF});
            if (isEOF(res)) return seq;
            if (res != null) seq.push(res);
        }
    }


    function evalAll(seq) {
        var i, form, evaled = [];
        for (i = 0; i < seq.length; i++) {
            form = seq[i];
            evaluate(form);
            evaled.push(form);
        }
        return evaled;
    }

    // Walk tree and expand all macros
    function expandMacros(form) {
        if (!isArray(form)) {
            return form;
        }
        else if (isArray(form) && isString(form[0])) {
            var args = form.slice(1);
            return macroexpand(cons(form[0], args.map(expandMacros)));
        }
        else {
            return map(expandMacros, form);
        }
    }

    function expandAllMacros(seq) {
        var i, form_, expanded = [];
        for (i = 0; i < seq.length; i++) {
            form_= expandMacros(expandMacros(seq[i]));
            expanded.push(form_);
        }
        return expanded;
    }

    // Compilation happens in three phases
    // 1) evaluate macros into JS functions
    // 2) expand macros into special forms
    // 3) compile special forms into code
    function compileString(s) {
        var seq = expandAllMacros(evalAll(readString(s)));
        var i, buffer = [];
        for (i = 0; i < seq.length; i++) {
            buffer.push(emit(seq[i]));
        }
        return buffer.join(';\n');
    }

    function prStr(x) {
        if (x == null) return "nil";
        else if (isNumber(x)) return str(x);
        else if (isBoolean(x)) {
            return x ? "true" : "false";
        }
        else if (isString(x)) {
            return x;
        }
        else if (isArray(x)) {
            if (x.length === 0) {
                return '()';
            } else {
                var y;
                var ys = x;
                var buffer = [];
                while (ys !== null) {
                    y = first(ys);
                    ys = next(ys);
                    buffer.push(prStr(y));
                }
                return str('(', buffer.join(' '), ')');
            }
        }
        else if (isArray(x)) {
            if (x.length === 0) {
                return '(array)';
            }
            return str('(array ', x.map(function(x) {
                return prStr(x);
            }).join(' '), ')');
        } else if (isFunction(x)) {
            return str('#js/function "', x.toString(), '"');
        } else if (isArrayLike(x)) {
            if (x.toString) {
                return x.toString();
            }
            else {
                return str('#js/object {',
                    Array.prototype.slice.call(x)
                        .map(function(x, i) { return str(i, ' ', prStr(x)); })
                        .join(', '),
                    '}');
            }
        } else {
            return "" + x;
        }
    }

    if (IS_NODE) {
        const fs = require('fs');
        CORE_MOD.loadFile = function(f) {
            return evalString(fs.readFileSync(f, 'utf8'));  
        };
    }

    function setMeta(obj, key, value) {
        obj[str("$ws$", key)] = value;
        return obj;
    }

    function meta(obj) {
        return Object.keys(obj)
                .filter(function (k) { return k.startsWith('$ws$'); })
                .reduce(function(meta, k) { meta[k] = obj[k]; return meta; }, {}); 
    }

    function setMacro(obj) {
        return setMeta(obj, 'macro', true);
    }

    CORE_MOD.NS = CURRENT_NS;

    define(TOP, CORE_NS.name, CORE_NS);
    define(TOP, 'js', IS_NODE ? {name: 'global', module: global} : {name: 'window', module: window});

    Object.assign(CORE_MOD, core);
    Object.assign(CORE_MOD, {
        compile: emit,
        eval: evaluate,
        RecursionPoint,
        evalString,
        compileString,
        readString,
        setMeta,
        setMacro,
        meta,
        prStr
    });

    GLOBAL.wonderscript = GLOBAL.wonderscript || {};
    GLOBAL.wonderscript.core = CORE_MOD;
    GLOBAL.wonderscript.compiler = {
        compile: emit,
        eval: evaluate,
        evalString,
        compileString,
        readString,
        evalAll,
        expandAllMacros,
        expandMacros
    };

    if (IS_NODE) module.exports = GLOBAL.wonderscript.compiler;

}.call(GLOBAL);
