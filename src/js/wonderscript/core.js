// jshint eqnull: true
// jshint esversion: 6
var GLOBAL = typeof module !== 'undefined' ? global : window;
GLOBAL.wonderscript = GLOBAL.wonderscript || {};
wonderscript.core = (function() {
    const IS_NODE = typeof module !== 'undefined' ? true : false;
    const IS_BROWSER = typeof window !== 'undefined' ? true : false;

    var GLOBAL, mori;
    if (IS_NODE) {
        mori   = require('mori');
    }

    if (IS_BROWSER) {
        if (typeof window.mori === 'undefined') {
            throw new Error('mori is required');
        }
        mori   = window.mori;
    }

    const EMPTY_LIST = mori.list();

    function isNumber(x) {
        return Object.prototype.toString.call(x) === '[object Number]';
    }

    function isString(x) {
        return Object.prototype.toString.call(x) === '[object String]';
    }

    function isBoolean(x) {
        return Object.prototype.toString.call(x) === '[object Boolean]';
    }

    function isTrue(x) {
        return x === true;
    }

    function isFalse(x) {
        return x === false;
    }

    function isFunction(x) {
        return Object.prototype.toString.call(x) === '[object Function]';
    }

    function isArrayLike(x) {
        return x != null && !isFunction(x) && isNumber(x.length);
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

    function isNil(x) {
        return x == null;
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
    
    function isSingleton(x) {
        return isObject(x) && Object.getPrototypeOf(Object.getPrototypeOf(x)) == null;
    }

    function name(x) {
        if (x == null) return null;
        return x.name;
    }

    function namespace(x) {
        if (x == null) return null;
        return x.ba;
    }

    var api = {
        isNumber,
        isString,
        isBoolean,
        isTrue,
        isFalse,
        isFunction,
        isArrayLike,
        isArray,
        isNull,
        isUndefined,
        isNil,
        isObject,
        isSingleton,
        toArray,
        str,
        print,
        name,
        namespace,
        EMPTY_LIST
    };

    Object.assign(api, mori);

    return api;

}());

if (typeof module !== 'undefined') {
    module.exports = wonderscript.core;
}
