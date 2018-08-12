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

    function isObject(x) {
        return Object.prototype.toString.call(x) === '[object Object]';
    }

    function isUndefined(x) {
        return x === void(0);
    }

    function isNull(x) {
        return x === null;
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
                var a = [], i = 0;
                while (xs != null) {
                    a.push(f.call(null, first(xs), i));
                    xs = next(xs);
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
            return Array.prototype.join.call(arguments, '');
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

    const html = function() {
        function renderAttrs(attrs) {
            return map(function(x) { return str(x[0], '=', x[1]); }, Object.entries(attrs)).join(', ');
        }

        function renderTag(form) {
            var tag = first(form),
                body = rest(form),
                attrs = first(body);
            if (isObject(attrs) && isUndefined(attrs.__proto___)) {
                return str("<", tag, " ", renderAttrs(attrs), ">", map(html, rest(body)), "</", tag, ">");
            }
            else {
                return str("<", tag, ">", map(html, body), "</", tag, ">");
            }
        }

        function renderComponent(form) {
            var comp = first(form);
                args = rest(form);
            return html(apply(comp, args));
        }
    
        return function(form) {
            if (isArray(form)) {
                if (isString(first(form))) {
                    return renderTag(form);
                }
                else if (isFunction(first(form))) {
                    return renderComponent(form);
                }
                else {
                    return map(html, form);
                }
            }
            else {
                return str(form);
            }
        };
    }();

    function renderTo(elem, s) {
        if (elem instanceof Document) {
            elem.write(s);
        }
        else if (elem instanceof Element) {
            elem.innerHTML = s;
        }
        else if (isString(elem)) {
            toArray(document.querySelectorAll(elem)).forEach(function(e) {
                e.innerHTML = s;
            });
        }
    }

    function appendTo(elem, s) {
        if (elem instanceof Document) {
            elem.write(s);
        }
        else if (elem instanceof Element) {
            elem.innerHTML = str(elem.innerHTML, s);
        }
        else if (isString(elem)) {
            toArray(document.querySelectorAll(elem)).forEach(function(e) {
                e.innerHTML = str(e.innerHTML, s);
            });
        }
    }
    
    function prependTo(elem, s) {
        if (elem instanceof Document) {
            elem.write(s);
        }
        else if (elem instanceof Element) {
            elem.innerHTML = str(s, elem.innerHTML);
        }
        else if (isString(elem)) {
            toArray(document.querySelectorAll(elem)).forEach(function(e) {
                e.innerHTML = str(s, e.innerHTML);
            });
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
        apply,
        html,
        renderTo,
        appendTo,
        prependTo,
        print
    };

}());
