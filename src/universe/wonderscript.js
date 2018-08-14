// jshint esversion: 6
// jshint eqnull: true
var universe = universe || {};
universe.wonderscript = function() {
    if (typeof require !== 'undefined') {
        universe.core = require('./core.js');
    }

    const { str, map, reduce, partition, first, rest, isObject, isObjectLiteral, isNull, isString, isNumber, isBoolean, isUndefined, isArray, print } = universe.core;

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

    const CORE_MOD = {};
    const CORE_NS = {name: 'universe.wonderscript', module: CORE_MOD};
    const CURRENT_NS = {
        value: CORE_NS
    };

    const RECURSION_POINT_CLASS = str(CORE_NS.name, '.RecursionPoint');

    function RecursionPoint(args) {
        this.args = args;
    }

    const RECUR_ERROR = new Error('recur can only be used in a tail position within a loop or function');

    const SPECIAL_CHARS = {
        '=': '_EQ_',
        '\\-': '_DASH_',
        '\\*': '_STAR_',
        '!': '_BANG_',
        '\\?': '_QUEST_'
    };

    function escapeChars(string) {
        if (string.indexOf('.') !== -1) throw new Error('"."s are reserved for namespaces');
        var ch;
        for (ch in SPECIAL_CHARS) {
            string = string.replace(new RegExp(ch, 'g'), SPECIAL_CHARS[ch]);
        }
        return string;
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

    function findVar(env, name) {
        var scope = lookup(env, name);
        if (scope == null) {
            throw new Error(str('Undefined variable: "', name, '"'));
        }
        else {
            return scope.vars[name];
        }
    }

    const TOP = env();
    // TODO: quote, macros, try/catch/finally
    function emit(form, env_) {
        var env_ = env_ || TOP;
        //if (isMacro(form)) form = macroexpand(form);
        if (isString(form)) return emitSymbol(form, env_);
        else if (isNumber(form)) return str(form);
        else if (isBoolean(form)) return form === true ? 'true' : 'false';
        else if (isNull(form)) return 'null';
        else if (isUndefined(form)) return 'undefined';
        else if (isObject(form)) {
            return str('({', map(function(xs) { return str(xs[0], ':', emit(xs[1], env_)); }, Object.entries(form)).join(', '), '})');
        }
        else if (isArray(form)) {
            if (isString(form[0])) {
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
                findVar(env, s); // throws error if undefined
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
      var name = escapeChars(form[1]);
      if (form[2])
        return str(CURRENT_NS.value, ".", name, " = ", emit(form[2], env), ";");
      else
        return str(CURRENT_NS.value, ".", name, " = null;");
    }
  
    function emitAssignment(form, env, opts) {
      var name = escapeChars(form[1]);
      return str(escapeChars(name), " = ", emit(form[2], env));
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
  
            for (i = 0; i < args.length; i++) {
                define(env_, args[i], true);
            }

            argsBuf = parseArgs(args);
            argsAssign = genArgAssigns(argsBuf);
            argsDef = genArgsDef(argsBuf);
    
            var buf = [argsAssign];
            buf.push(compileRecursiveBody(form.slice(2), args, env_));
  
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

    CORE_MOD.array = function() {
        return Array.prototype.slice.call(arguments);
    };

    define(TOP, 'wonderscript.core', CORE_NS);
    define(TOP, 'js', typeof module !== 'undefined' ? {name: 'global', module: global} : {name: 'window', module: window});

    Object.assign(CORE_MOD, {compile: emit, eval: evaluate, RecursionPoint});
    Object.assign(CORE_MOD, universe.core);

    return CORE_MOD;
}();

if (typeof module !== 'undefined') {
    module.exports = universe.wonderscript;
    global.universe = universe;
}
if (typeof window !== 'undefined') {
    window.universe = universe;
}
