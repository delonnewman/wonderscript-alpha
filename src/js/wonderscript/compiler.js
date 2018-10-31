// jshint esversion: 6
// jshint eqnull: true
var GLOBAL = typeof module !== 'undefined' ? global : window;
GLOBAL.wonderscript = GLOBAL.wonderscript || {};
wonderscript.compiler = function() {
    const IS_NODE = typeof module !== 'undefined' ? true : false;
    const IS_BROWSER = typeof window !== 'undefined' ? true : false;

    var GLOBAL, core, edn;
    if (IS_NODE) {
        core = require('./core.js');
        edn = require('./edn.js');
    }

    if (IS_BROWSER) {
        core = wonderscript.core;
        edn  = wonderscript.edn;
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
        isSingleton,
        isNull,
        isNil,
        isString,
        isFunction,
        isNumber,
        isBoolean,
        isUndefined,
        isArray,
        isMap,
        isList,
        isVector,
        isSet,
        print,
        isEmpty,
        isArrayLike,
        isSymbol,
        isKeyword,
        name,
        namespace,
        mapcat,
        identity,
        intoArray,
        symbol
    } = core;

    const { read, PushBackReader } = edn;

    // operators
    const MOD_SYM = symbol('mod');
    const LT_SYM  = symbol('<');
    const GT_SYM  = symbol('>');

    // special form tags
    const QUOTE_SYM   = symbol('quote');
    const DEF_SYM     = symbol('def');
    const COND_SYM    = symbol('cond');
    const JS_SYM      = symbol('js');
    const FN_SYM      = symbol('fn*');
    const LOOP_SYM    = symbol('loop');
    const RECUR_SYM   = symbol('recur');
    const THROW_SYM   = symbol('throw');
    const TRY_SYM     = symbol('try');
    const CATCH_SYM   = symbol('catch');
    const FINALLY_SYM = symbol('finally');
    const DO_SYM      = symbol('do');
    const LET_SYM     = symbol('let');
    const DOT_SYM     = symbol('.');
    const NEW_SYM     = symbol('new');
    const SET_SYM     = symbol('set!');

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

    const CORE_MOD = core;
    const CORE_NS = {name: 'wonderscript.core', module: CORE_MOD};
    const CURRENT_NS = {
        value: CORE_NS
    };

    const RECURSION_POINT_CLASS = str(CORE_NS.name, '.RecursionPoint');

    function RecursionPoint(args) {
        this.args = args;
    }

    const RECUR_ERROR = new Error('recur can only be used in a tail position within a loop or function');

    // TODO: add sub, mult, and div to core
    var names = {
        '=': 'equals',
        'not=': 'notEquals',
        '<': 'lt',
        '>': 'gt',
        '<=': 'lte',
        '>=': 'gte',
        '+': 'sum',
        '-': 'sub',
        '*': 'mult',
        '/': 'div'
    };

    function cap(x) {
        if (x.length === 0) return x;
        return str(x[0].toUpperCase(), x.slice(1));
    }

    const BANG  = '!';
    const PRED  = '?';
    const STAR  = '*';
    const ARROW = '->';
    const DASH  = '-';
    const UNDER = '_';
    const TO    = 'to';
    const IS    = 'is';
    const EMPTY = '';

    function wsNameToJS(x) {
        if (names[x]) return names[x];
        var prefix = null, parts;
        if (x.endsWith(PRED)) {
            prefix = IS;
            x = x.slice(0, x.length - 1);
        }
        else if (x.endsWith(BANG)) {
            x = x.slice(0, x.length - 1);
        }
        else if (x.startsWith(STAR) && x.endsWith(STAR)) {
            return x.slice(0, x.length - 1).slice(1).split(DASH).map(function(s) { return s.toUpperCase(); }).join(UNDER);
        }
        if (x.indexOf(ARROW) !== -1) parts = x.split(ARROW).reduce(function(a, x) { return [].concat(a, TO, x); });
        else parts = prefix ? [].concat(prefix, x.split(DASH)) : x.split(DASH);
        return [].concat(parts[0], parts.slice(1).map(cap)).join(EMPTY);
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
        return isFunction(x) && x.$ws$isMacro === true;
    }

    function macroexpand(form) {
        if (!isList(form)) {
            return form;
        }
        else {
            var tag = first(form);
            if (SPECIAL_FORMS[str(tag)]) return form;
            else if (isSymbol(tag)) {
                var val = findNamespaceVar(tag);
                if (val === null) return form;
                else {
                    if (isMacro(val)) {
                        return macroexpand(val.apply(null, intoArray(rest(form))));
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

    function isTaggedString(x) {
        return isArray(x) && x[0] === 'string';
    }

    function emitCollection(open, close, list, env) {
        return str(open, list.map(function(x) { return emit(x, env); }).join(', '), close);
    }

    function emitList(form, env) {
        var a = intoArray(form);
        return emitCollection('wonderscript.core.list(', ')', a, env);
    }

    function emitHashMap(form, env) {
        var a = intoArray(mapcat(identity, form));
        return emitCollection('wonderscript.core.hashMap(', ')', a, env);
    }

    function emitVector(form, env) {
        var a = intoArray(form);
        return emitCollection('wonderscript.core.vector(', ')', a, env);
    }

    function emitSet(form, env) {
        var a = intoArray(form);
        return emitCollection('wonderscript.core.set([', '])', a, env);
    }

    function emitKeyword(form) {
        var nm = name(form), ns = namespace(form);
        if (nm != null && ns != null) {
            return str('wonderscript.core.keyword("', ns, '", "', nm, '")');
        }
        else if (ns == null) {
            return str('wonderscript.core.keyword("', nm, '")');
        }
        else {
            throw new Error('keyword must at least have a name');
        }
    }

    const TOP = env();
    // TODO: try/catch/finally
    function emit(form_, env_) {
        var env_ = env_ || TOP;
        var form = macroexpand(form_);
        if (isSymbol(form)) {
            return emitSymbol(form, env_);
        }
        else if (isString(form)) {
            return JSON.stringify(form);
        }
        else if (isNumber(form)) {
            return str(form);
        }
        else if (isBoolean(form)) {
            return form === true ? 'true' : 'false';
        }
        else if (isNil(form)) {
            return 'null';
        }
        else if (isKeyword(form)) {
            return emitKeyword(form);
        }
        else if (isMap(form)) {
            return emitHashMap(form, env);
        }
        else if (isVector(form)) {
            return emitVector(form, env);
        }
        else if (isSet(form)) {
            return emitSet(form, env);
        }
        else if (isList(form)) {
            var tag = first(form);
            if (isEmpty(form)) return 'wonderscript.core.EMPTY_LIST';
            else if (isSymbol(tag)) {
                switch(tag) {
                  case DEF_SYM:
                    return emitDef(form, env_);
                  case QUOTE_SYM:
                    return emitQuote(form, env_);
                  case COND_SYM:
                    return emitCond(form, env_);
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
                  case 'mod':
                    return str('(', emit(form[1], env_), '%', emit(form[2], env_), ')');
                  case '<':
                    return str('(', emit(form[1], env_), '<', emit(form[2], env_), ')');
                  case '>':
                    return str('(', emit(form[1], env_), '>', emit(form[2], env_), ')');
                  case '<=':
                    return str('(', emit(form[1], env_), '<=', emit(form[2], env_), ')');
                  case '>=':
                    return str('(', emit(form[1], env_), '>=', emit(form[2], env_), ')');
                  case 'not':
                    return str('!(', emit(form[1], env_), ')');
                  case 'or':
                    return emitBinOperator(['||'].concat(form.slice(1)), env_);
                  case 'and':
                    return emitBinOperator(['&&'].concat(form.slice(1)), env_);
                  case 'bit-not':
                    return str('~(', emit(form[1], env_), ')');
                  case 'bit-or':
                    return emitBinOperator(['|'].concat(form.slice(1)), env_);
                  case 'bit-xor':
                    return emitBinOperator(['^'].concat(form.slice(1)), env_);
                  case 'bit-and':
                    return emitBinOperator(['&'].concat(form.slice(1)), env_);
                  case 'bit-shift-left':
                    return emitBinOperator(['<<'].concat(form.slice(1)), env_);
                  case 'bit-shift-right':
                    return emitBinOperator(['>>'].concat(form.slice(1)), env_);
                  case 'unsigned-bit-shift-right':
                    return emitBinOperator(['>>>'].concat(form.slice(1)), env_);
                  case 'identical?':
                    return emitBinOperator(['==='].concat(form.slice(1)), env_);
                  case 'equiv?':
                    return emitBinOperator(['=='].concat(form.slice(1)), env_);
                  case '+':
                  case '-':
                  case '/':
                  case '*':
                    return emitBinOperator(form, env_);
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

    function emitSymbol(sym, env) {
        // fully-qualified
        var ns = namespace(sym);
        var nm = name(sym);
        var s = str(sym);
        if (ns != null) {
            if (nm.indexOf('.') !== -1) throw new Error('"." are reserved for namespaces');
            var scope = lookup(env, ns);
            if (scope === null) throw new Error('Unknown namespace: ' + ns);
            else {
                var ns_ = scope.vars[ns];
                if (isUndefined(ns_.module[nm])) {
                    throw new Error('Undefined variable: ' + nm + ' in namespace: ' + ns);
                }
                return str(ns_.name, '.', escapeChars(nm));
            }
        }
        // unqualified
        else {
            var s = escapeChars(str(sym));
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
        if (form.length === 2) throw new Error('throw should have 2 elements');
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
            return emitTrownException(x, env);
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
        var tag  = first(rest(form));
        var name = escapeChars(tag), code, value, def;
        var val  = first(rest(rest(form)));
        if (val != null) {
            code = emit(val, env); value = eval(code);
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
      if (isString(form[0]) && isMacro(findNamespaceVar(form[0]))) throw new Error('Macros cannot be evaluated in this context');
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

    function readJS(exp) {
        var i;
        if (isString(exp)) {
            if (exp.startsWith(':')) {
                return Keyword.intern(exp.substring(1));
            } else if (exp.startsWith("'")) {
                return list(QUOTE_SYM, Sym.intern(exp.substring(1)));
            } else if (exp.startsWith('"') && exp.endsWith('"')) {
                return exp.substring(1).substring(0, exp.length - 2);
            } else {
                return Sym.intern(exp);
            }
        }
        else if (isArray(exp)) {
            if (exp.length === 0) return Cons.EMPTY;
            if (exp.length === 1) return cons(readJS(exp[0]), Cons.EMPTY);
            var xs = null;
            var last = null, x;
            for (i = exp.length - 1; i >= 0; i--) {
                // use & to read pairs
                if (exp[i] === '&') {
                    if (exp.length === 2) return cons(Cons.EMPTY, readJS(last));
                    i--;
                    x = cons(readJS(exp[i]), last);
                    if (exp.length === 3) return x;
                    xs = dropLast(xs);
                } else {
                    x = readJS(exp[i]);
                }
                xs = cons(x, xs);
                last = x;
            }
            return xs;
        } 
        else if (isFunction(exp)) return exp;
        else if (isObject(exp)) {
            var keys = Object.getOwnPropertyNames(exp);
            if (keys.length === 0) return ArrayMap.EMPTY;
            var entries = [];
            for (i = 0; i < keys.length; i++) {
                entries.push(Sym.intern(keys[i]));
                entries.push(readJS(exp[keys[i]]));
            }
            return new ArrayMap(null, entries);
        } else {
            return exp;
        }
    }

    function evalString(s) {
        var r = new PushBackReader(s);
        var res, ret;
        while (true) {
            res = read(r, {eofIsError: false, eofValue: null});
            if (res != null) {
                ret = evaluate(res);
            }
            if (res == null) return ret;
        }
    }

    const EOF = {eof: true};

    function compileString(s) {
        var r = new PushBackReader(s);
        var res, ret, buff = [];
        while (true) {
            res = read(r, {eofIsError: false, eofValue: EOF});
            if (res !== EOF) {
                ret = emit(res);
                if (ret != null) buff.push(ret);
            }
            if (res === EOF) break;
        }
        return buff.join(';\n');
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
        }
        else if (isFunction(x)) {
            return str('#js/function "', x.toString(), '"');
        }
        else if (isArrayLike(x)) {
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

    CORE_MOD.array = function() {
        return Array.prototype.slice.call(arguments);
    };

    CORE_MOD.isNil = core.isNull;

    CORE_MOD.defmacro = function(name, args) {
        var body = Array.prototype.slice.call(arguments, 2);
        return [DO_SYM,
                [DEF_SYM, name, cons(FN_SYM, cons(args, body))],
                [SET_SYM, [DOT_SYM, name, '-$ws$isMacro'], true],
                [QUOTE_SYM, name]]; 
    };
    CORE_MOD.defmacro.$ws$isMacro = true;

    CORE_MOD.NS = CURRENT_NS;

    define(TOP, CORE_NS.name, CORE_NS);
    define(TOP, 'js', IS_NODE ? {name: 'global', module: global} : {name: 'window', module: window});

    Object.assign(CORE_MOD, core);
    Object.assign(CORE_MOD, {compile: emit, eval: evaluate, RecursionPoint, evalString, compileString, prStr});

    //GLOBAL.wonderscript = GLOBAL.wonderscript || {};
    //GLOBAL.wonderscript.core = CORE_MOD;
    if (IS_NODE) module.exports = CORE_MOD;

    return CORE_MOD;
}();
