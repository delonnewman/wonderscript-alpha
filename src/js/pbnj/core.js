// jshint eqnull: true
// jshint esversion: 6
var pbnj = pbnj || {};
pbnj.core = (function() {
    
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

    var html = function() {
        function renderCSSDef(def) {
            return str(def[0], ' { ', renderCSSRules(def[1]), ' }');
        }

        function renderCSSDefs(defs) {
            return map(renderCSSDef, Object.entries(defs)).join('\n');
        }

        function renderCSSRules(rules) {
            return map(function(x) { return str(x[0], ': ', x[1], ';'); }, Object.entries(rules)).join(' ');
        }

        function renderAttr(attr) {
            var name = attr[0], value = attr[1];
            if (name === 'style' && isObjectLiteral(value)) {
                value = renderCSSRules(value);
            }
            return str(name, '="', value, '"');
        }

        function renderAttrs(attrs) {
            return map(renderAttr, Object.entries(attrs)).join(', ');
        }

        function renderTag(form) {
            var head,
                tag = first(form),
                body = rest(form),
                attrs = first(body);
            if (isObjectLiteral(attrs)) {
                head = str("<", tag, " ", renderAttrs(attrs), ">");
                if (html.singletons[tag] != null) {
                    return head;
                }
                else {
                    return str(head, map(html, rest(body)), "</", tag, ">");
                }
            }
            else {
                head = str("<", tag, ">");
                if (html.singletons[tag] != null) {
                    return head;
                }
                else {
                    return str(head, map(html, rest(body)), "</", tag, ">");
                }
            }
        }

        function renderComponent(form) {
            var comp = first(form);
                args = rest(form);
            return html(apply(comp, args));
        }

        function evalDefinition(form) {
            var attrs = form[1], value = form[2],
                comp  = Object.assign({value: value}, attrs),
                name  = either(get(attrs, 'name'), raise('name is required'));
            html.components[name] = comp;
            return '';
        }
    
        var html = function(form) {
            if (isString(form) && !isUndefined(html.components[form])) {
                return html.components[form].value;
            }
            else if (isArray(form)) {
                var tag = first(form);
                if (isString(tag)) {
                    if (tag === 'define') {
                        return evalDefinition(form);
                    }
                    else {
                        var x = html(tag);
                        if (isFunction(x)) {
                            return renderComponent([x].concat(rest(form)));
                        }
                        else if (isString(x)) {
                            if (x !== tag) {
                                return x;
                            }
                            return renderTag([x].concat(rest(form)));
                        }
                        else {
                            throw new Error('Unable to evaluate tag value: "' + tag + '"');
                        }
                    }
                }
                else if (isFunction(first(form))) {
                    return renderComponent(form);
                }
                else {
                    return reduce(str, map(html, form));
                }
            }
            else {
                return str(form);
            }
        };
        html.components = {};
        html.singletons = {
            img: true,
            link: true
        };

        html(['define', {name: "!!!", doc: "A doctype tag"}, "<!DOCTYPE html>"]);
        html(['define', {name: "comment", doc: "Include a comment"}, function() { return str("<!-- ", toArray(arguments).join(''), " -->"); }]);
        html(['define', {name: "css", doc: "Interpret CSS"}, function(defs) { return ['style', {type: "text/css"}, renderCSSDefs(defs)]; }]);

        return html;
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
        isNull,
        isUndefined,
        isObject,
        isObjectLiteral,
        exists,
        toArray,
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
        partition,
        range,
        memoize,
        apply,
        html,
        renderTo,
        appendTo,
        prependTo,
        either,
        maybe,
        raise,
        print
    };

}());

if (typeof module !== 'undefined') {
    module.exports = pbnj.core;
}
