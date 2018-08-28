// jshint eqnull: true
// jshint esversion: 6
var pbnj = pbnj || {};
pbnj.utils = (function() {
    
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
        return x != null && isNumber(x.length) && !isFunction(x);
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

    function isObjectLiteral(x) {
        return isObject(x) && Object.getPrototypeOf(Object.getPrototypeOf(x)) == null;
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

    const print = console.log.bind();

    function str(x) {
        if (x == null) {
            return '';
        }
        else {
            return Array.prototype.join.call(arguments, '');
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
        str,
        print
    };

}());

if (typeof module !== 'undefined') {
    module.exports = pbnj.utils;
}
