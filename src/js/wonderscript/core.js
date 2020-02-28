// jshint eqnull: true
// jshint esversion: 6
const GLOBAL = typeof module !== 'undefined' ? global : window;
(function() {

    this.wonderscript = this.wonderscript || {};
    this.wonderscript.core = this.wonderscript.core || {};

    function Sym(namespace, name) {
        this._namespace = namespace;
        this._name = name;
    }
    
    Sym.fromString = function(str) {
        if ( str.indexOf('/') === -1 ) {
            return new Sym(null, str);
        }
        else {
            var parts = str.split('/');
            return new Sym(parts[0], parts.slice(1).join('/'));
        }
    };

    Sym.protoytpe = Object.create(null);
    
    Sym.prototype.name = function() {
        return this._name;
    };
    
    Sym.prototype.namespace = function() {
        return this._namespace;
    };

    Sym.prototype.toString = function() {
        if ( this._namespace ) {
            return str(this._namespace, '/', this._name);
        }
        else {
            return str(this._name);
        }
    };

    function isSymbol(x) {
        return x instanceof Sym;
    }

    function symbol() {
        if (arguments.length === 1) {
            return new Sym(null, arguments[0]);
        }
        else if (arguments.length === 2) {
            return new Sym(arguments[0], arguments[1]);
        }
        else {
            throw new Error("Wrong number of arguments expected 1 or 2, got: " + arguments.length);
        }
    }

    function str() {
        if (arguments.length === 0) return '';
        return Array.prototype.join.call(arguments, '');
    }

    function isNumber(x) {
        return Object.prototype.toString.call(x) === '[object Number]';
    }

    function isString(x) {
        return Object.prototype.toString.call(x) === '[object String]';
    }

    function isBoolean(x) {
        return Object.prototype.toString.call(x) === '[object Boolean]';
    }

    function isFunction(x) {
        return Object.prototype.toString.call(x) === '[object Function]';
    }

    function isArrayLike(x) {
        return x != null && isNumber(x.length);
    }

    function isArray(x) {
        return Object.prototype.toString.call(x) === '[object Array]';
    }

    function toArray(x) {
        if (x == null) {
            return [];
        }
        else if (isFunction(x.toArray)) {
            return x.toArray();
        }
        else {
            return Array.prototype.slice.call(x);
        }
    }

    function array() {
        return Array.prototype.slice.call(arguments);
    }

    function isObject(x) {
        return Object.prototype.toString.call(x) === '[object Object]';
    }

    function isUndefined(x) {
        return x === void(0);
    }

    function isNull(x) {
        return x === null;
    }

    function isNil(x) {
        return x == null;
    }

    // TODO: add support for maps, sets, and objects
    function first(x) {
        if (x == null) return null;
        else if (isFunction(x.first)) {
            return x.first();
        }
        else if (isArrayLike(x)) {
            return x[0];
        }
        else {
            throw new Error("Cannot get the first element of: " + x);
        }
    }

    function rest(x) {
        if (x == null) return [];
        else if (isFunction(x.rest)) {
            return x.rest();
        }
        else if (isFunction(x.next)) {
            var val = x.next();
            return val == null ? [] : val;
        }
        else if (isArrayLike(x)) {
            if (isFunction(x.slice)) {
                return x.slice(1);
            }
            else {
                return Array.prototype.slice.call(x, 1);
            }
        }
        else {
            throw new Error("Cannot get the rest of the elements of: " + x);
        }
    }

    function next(x) {
        if (x == null) return null;
        else if (isFunction(x.next)) {
            return x.next();
        }
        else if (isFunction(x.rest)) {
            var val = x.rest();
            return isEmpty(val) ? null : val;
        }
        else if (isArrayLike(x)) {
            if (x.length <= 1) {
                return null;
            }
            else {
                if (isFunction(x.slice)) {
                    return x.slice(1);
                }
                else {
                    return Array.prototype.slice.call(x, 1);
                }
            }
        }
        else {
            throw new Error("Cannot get the rest of the elements of: " + x);
        }
    }

    function cons(x, seq) {
        if (seq == null) return [x];
        else if (isFunction(seq.cons)) {
            return seq.cons(x);
        }
        else if (isArrayLike(seq)) {
            if (isString(seq)) {
                return [x, seq].join('');
            }
            else {
                return [x].concat(seq);
            }
        }
        else {
            throw new Error("Cannot cons and element to: " + seq);
        }
    }

    function isEmpty(x) {
        if (x == null) return true;
        else if (isArrayLike(x)) {
            return x.length === 0;
        }
        else {
            return next(x) == null;
        }
    }

    function map(f, xs) {
        if (arguments.length === 2) {
            if (isEmpty(xs)) {
                return [];
            }
            else {
                var a = [];
                while (xs != null) {
                    a.push(f.call(null, first(xs)));
                    xs = next(xs);
                }
                return a;
            }
        }
        else {
            throw new Error('Wrong number of arguments expected 2, got: ' + arguments.length);
        }
    }

    function reduce(f, xs, init) {
        if (arguments.length >= 2) {
            if (init == null) {
                init = first(xs);
                xs   = next(xs);
            }
            if (isEmpty(xs)) {
                return init;
            }
            else {
                var x = init;
                while (xs != null) {
                    x = f.call(null, x, first(xs));
                    xs = next(xs);
                }
                return x;
            }
        }
        else {
            throw new Error('Wrong number of arguments expected at least 2, got: ' + arguments.length);
        }
    }

    const print = console.log.bind(console);

    function take(n, xs) {
        if (n === 0) return xs;
        else if (isEmpty(xs)) return [];
        else {
            return Array.prototype.slice.call(xs, 0, n);
        }
    }
    
    function memoize(f) {
        var memoized = function() {
            var hash = arguments[0]; // str.apply(null, arguments);
            if (memoized.cache[hash] === void(0)) {
                memoized.cache[hash] = f.apply(this, arguments);
            }
            return memoized.cache[hash];
        };
        memoized.cache = {};
        return memoized;
    }
    
    function drop(n, xs) {
        if (n === 0) return xs;
        else if (isEmpty(xs)) return [];
        else {
            return Array.prototype.slice.call(xs, n);
        }
    }
    
    function partition(n, xs) {
        if (isEmpty(xs)) {
            return [];
        }
        else if (xs.length === n) {
            return [xs];
        }
        else {
            var a = [], i, j, x;
            for (i = 0; i < xs.length; i = i + n) {
                x = [];
                for (j = 0; j < n; j++) { 
                    x.push(xs[i + j]);
                }
                a.push(x);
            }
            return a;
        }
    }
    
    function range() {
        if (arguments.length === 1) {
            start = 0;
            stop  = arguments[0];
            step  = 1;
        }
        else if (arguments.length === 2) {
            start = arguments[0];
            stop  = arguments[1];
            step  = 1;
        }
        else if (arguments.length >= 3) {
            start = arguments[0];
            stop  = arguments[1];
            step  = arguments[2];
        }
        if (start === stop) {
            return [start];
        }
        else {
            var a = [], i;
            for (i = start; a.length < stop; i = i + step) {
                a.push(i);
            }
            return a;
        }
    }

    function apply(f, args, ctx) {
        if (arguments.length === 1) {
            return function(args, ctx) {
                return f.apply(ctx, args);
            };
        }
        else if (arguments.length >= 2) {
            return f.apply(ctx, args);
        }
        else {
            throw new Error("Wrong number of arguments, expected at least 1, got: " + arguments.length);
        }
    }

    function compose() {
        var fns = arguments;
        return function() {
            var i, x = fns[0].apply(null, arguments);
            for (i = 1; i < fns.length; i++) {
                x = fns[i].call(null, x);
            }
            return x;
        };
    }

    function get(m, key, alt) {
        var alt_ = alt == null ? null : alt;
        if (m == null || key == null) return alt_;
        var val = isFunction(m.get) ? m.get(key, alt) : m[key];
        if (val == null) return alt_;
        return val;
    }

    function maybe(val, act, alt) {
        if (val == null) return alt != null ? alt : null;
        else {
          if (act != null) {
            return act.call(null, val);
          }
          else {
            return val;
          }
        }
    }
    
    function either(val, right, left) {
        if (val == null) {
            return right.call();
        }
        else {
            return left != null ? left.call(null, val) : val;
        }
    }


    // TODO: see if there's a way to make the trace start with the callee
    function raise(msg) {
        var e = isString(msg) ? new Error(msg) : msg;
        return function() {
            throw msg;
        };
    }

    function isObjectLiteral(x) {
        return isObject(x) && Object.getPrototypeOf(Object.getPrototypeOf(x)) == null;
    }

    Object.assign(this.wonderscript.core, {
        isNumber,
        isString,
        isBoolean,
        isFunction,
        isArrayLike,
        isArray,
        isNull,
        isNil,
        isUndefined,
        isObject,
        isObjectLiteral,
        toArray,
        array,
        first,
        rest,
        next,
        cons,
        get,
        map,
        reduce,
        take,
        drop,
        str,
        symbol,
        isSymbol,
        Sym,
        partition,
        range,
        memoize,
        apply,
        either,
        maybe,
        raise,
        print
    });

    if (typeof module !== 'undefined') {
        module.exports = this.wonderscript.core;
    }

}.call(GLOBAL));
