JSGLOBAL = typeof module !== 'undefined' ? global : window;
(function() {

    this.wonderscript = this.wonderscript || {};
    this.wonderscript.core = this.wonderscript.core || {};

    const EMPTY_ARRAY  = Object.freeze([]);
    const EMPTY_STRING = '';

    function str() {
        if (arguments.length === 0) return EMPTY_STRING;
        return Array.prototype.join.call(arguments, EMPTY_STRING);
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

    function isSet(x) {
        return Object.prototype.toString.call(x) === '[object Set]';
    }

    function isMap(x) {
        return Object.prototype.toString.call(x) === '[object Map]';
    }

    function toArray(col) {
        if (col == null) {
            return EMPTY_ARRAY;
        }

        if (isArrayLike(col)) {
            return Array.prototype.slice.call(col);
        }

        if (isFunction(col.toArray)) {
            return col.toArray();
        }

        var a = [];
        while (col != null) {
            a.push(first(col));
            col = next(col);
        }
        return a;
    }

    function array() {
        return Array.prototype.slice.call(arguments);
    }

    function concat() {
        return Array.prototype.concat.apply(EMPTY_ARRAY, arguments);
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

    function isIterator(x) {
        return x != null && isFunction(x[Symbol.iterator])
    }

    function first(col) {
        if (col == null) return null;

        if (isFunction(col.first)) {
            return col.first();
        }

        if (isArrayLike(col)) {
            return col[0] || null;
        }

        if (isIterator(col)) {
            return col[Symbol.iterator]().next().value || null
        }

        throw new Error("Cannot get the first element of: " + x);
    }

    function rest(col) {
        var val = next(col)
        return val == null ? EMPTY_ARRAY : val;
    }

    function next(col) {
        if (col == null) return null;

        if (isFunction(col.next)) {
            return col.next();
        }

        if (isArrayLike(col)) {
            if (col.length === 0) {
                return null;
            }

            return Array.prototype.slice.call(col, 1);
        }

        if (isFunction(col.forEach)) {
            var a = [], i = 0;
            col.forEach(function (val) {
                if (i > 0) {
                    a.push(val);
                }
                i++
            });
            return i === 0 ? null : a
        }

        throw new Error("Cannot get the next element of: " + col);
    }

    function cons(x, col) {
        if (col == null) return [x];

        if (isFunction(col.cons)) {
            return col.cons(x);
        }

        if (isArrayLike(col)) {
            if (isString(col)) {
                return [x, col].join('');
            }
            else {
                return [x].concat(col);
            }
        }

        throw new Error("Cannot cons and element to: " + col);
    }

    function isEmpty(x) {
        if (x == null) return true;

        if (isArrayLike(x)) {
            return x.length === 0;
        }

        return next(x) == null;
    }

    function map(f, xs) {
        if (arguments.length !== 2) {
            throw new Error('Wrong number of arguments expected 2, got: ' + arguments.length);
        }

        if (isEmpty(xs)) {
            return EMPTY_ARRAY;
        }

        var a = [];
        while (xs != null) {
            a.push(f.call(xs, first(xs)));
            xs = next(xs);
            if (isEmpty(xs)) break;
        }
        return a;
    }

    function filter(f, xs) {
        if (arguments.length === 2) {
            if (isEmpty(xs)) {
                return [];
            }
            else {
                var a = [], x;
                while (xs != null) {
                    x = first(xs);
                    if (f.call(xs, x)) a.push(x);
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
                    x = f.call(xs, x, first(xs));
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
        let start, stop, step;

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

        const a = [];
        for (let i = start; a.length < stop; i = i + step) {
            a.push(i);
        }
        return a;
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
            throw e;
        };
    }

    function isObjectLiteral(x) {
        return isObject(x) && Object.getPrototypeOf(Object.getPrototypeOf(x)) == null;
    }

    function Namespace(name, module) {
        this.name = name;
        this.module = module || {};
        JSGLOBAL[name] = this.module;
    }

    Namespace.prototype = Object.create(null);

    Namespace.prototype.toString = function() {
        return str("#<Namespace ", this.name, ">");
    };

    function createNs(name, module) {
        return new Namespace(name, module);
    }

    function isNamespace(x) {
        return x instanceof Namespace;
    }

    // TODO: add protocols
    function Protocol(docString, methods) {
        this.docString = docString;
        this.methods = methods;
    }

    const SYMBOL_META = {};
    const META_SYMBOL = Symbol('wonderscriptMetaData');

    function setMeta(obj, key, value) {
        var meta;
        if (isString(obj)) {
            obj = new String(obj);
        }
        else {
            meta = obj[META_SYMBOL];
            if (!meta) obj[META_SYMBOL] = {};
            obj[META_SYMBOL][key] = value;
        }
        return obj;
    }

    function resetMeta(obj, meta) {
        obj[META_SYMBOL] = meta;
        return obj;
    }

    function meta(obj) {
        return obj[META_SYMBOL] || {};
    }

    function getMeta(obj, key) {
        return meta(obj)[key];
    }

    Object.assign(this.wonderscript.core, {
        isNumber: isNumber,
        isString: isString,
        isBoolean: isBoolean,
        isFunction: isFunction,
        isArrayLike: isArrayLike,
        isArray: isArray,
        isIterator: isIterator,
        isSet: isSet,
        isMap: isMap,
        isNull: isNull,
        isNil: isNil,
        isUndefined: isUndefined,
        isObject: isObject,
        isObjectLiteral: isObjectLiteral,
        isEmpty: isEmpty,
        toArray: toArray,
        array: array,
        concat: concat,
        first: first,
        rest: rest,
        next: next,
        cons: cons,
        get: get,
        map: map,
        reduce: reduce,
        filter: filter,
        take: take,
        drop: drop,
        str: str,
        partition: partition,
        range: range,
        memoize: memoize,
        apply: apply,
        compose: compose,
        either: either,
        maybe: maybe,
        raise: raise,
        print: print,
        isNamespace: isNamespace,
        createNs: createNs,
        setMeta: setMeta,
        getMeta: getMeta,
        resetMeta: resetMeta,
        meta: meta
    });

    if (typeof module !== 'undefined') {
        module.exports = this.wonderscript.core;
    }

}.call(JSGLOBAL));
