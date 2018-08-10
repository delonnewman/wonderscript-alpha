// jshint eqnull: true
// jshint esversion: 6
window.universe = window.universe || {};
window.universe.core = (function() {
    
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

    function exists(x) {
        return x != null;
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

    function next(x) {
        if (x == null) return null;
        else if (isFunction(x.next)) {
            return x.next();
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

    function rest(x) {
        var val = next(x);
        return val == null ? [] : val;
    }

    function cons(x, seq) {
        if (seq == null) return [x];
        else if (isFunction(seq.cons)) {
            return seq.cons(x);
        }
        else if (isArrayLike(x)) {
            if (isString(x)) {
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
                var a = [], i = 0, x;
                for (x = first(xs); xs != null; xs = next(xs)) {
                    a.push(f.call(null, x, i));
                    i++;
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
                var x;
                for (x = first(xs); xs != null; xs = next(xs)) {
                    init = f.call(null, init, x);
                }
                return init;
            }
        }
        else {
            throw new Error('Wrong number of arguments expected at least 2, got: ' + arguments.length);
        }
    }

    const print = console.log.bind();

    function take(n, xs) {
        if (n === 0) return xs;
        else if (isEmpty(xs)) return [];
        else {
            return Array.prototype.slice.call(xs, 0, n);
        }
    }
    
    function str(x) {
        if (x == null) {
            return '';
        }
        else {
            Array.prototype.join.call(arguments, '');
        }
    }
    
    function memoize(f) {
        var memoized = function memoized() {
            var hash = str.apply(null, arguments);
            if (memoized.cache[hash] == null) {
                memoized.cache[hash] = f.apply(this, arguments);
            }
            return memoized.cache[hash];
        };
        memoized.cache = {};
        return f;
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
                    x.push(xs[i]);
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
            for (i = start; i <= stop; i = i + step) {
                a.push(i);
            }
            return a;
        }
    }
    
    return {
        isNumber,
        isString,
        isBoolean,
        isFunction,
        isArrayLike,
        isArray,
        exists,
        first,
        rest,
        next,
        cons,
        map,
        reduce,
        take,
        drop,
        str,
        partition,
        range,
        memoize,
        print
    };

}());
