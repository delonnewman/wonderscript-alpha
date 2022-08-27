import {FALSE_SYM, NIL_SYM, TRUE_SYM} from "./constants";
import {
    first,
    isArray,
    isArrayLike,
    isBoolean,
    isFunction,
    isMap,
    isNumber,
    isString,
    map,
    next,
    str
} from "../lang/runtime";
import {Form, isKeyword, isSymbol} from "./core";
import {Nil} from "../lang/Nil";

export function prStr(x: Form): string {
    if (x == null) return NIL_SYM;
    else if (isNumber(x)) return str(x);
    else if (isBoolean(x)) {
        return x ? TRUE_SYM : FALSE_SYM;
    }
    else if (isSymbol(x)) {
        return str(x);
    }
    else if (isString(x)) {
        return JSON.stringify(x);
    }
    else if (isKeyword(x)) {
        return str(":", x[1]);
    }
    else if (isArray(x)) {
        if (x.length === 0) {
            return '()';
        }
        else {
            let y;
            let ys: Readonly<any[]> | Nil = x;
            const buffer = [];
            while (ys !== null) {
                y = first(ys);
                ys = next(ys);
                buffer.push(prStr(y));
            }
            return str('(', buffer.join(' '), ')');
        }
    }
    else if (isFunction(x)) {
        return str('#js/function "', x.toString(), '"');
    }
    else if (isMap(x)) {
        var s = map(function(entry) { return str(prStr(entry[0]), ' ', prStr(entry[1])); }, x).join(' ');
        return str('{', s, '}');
    }
    else if (x.toString) {
        return x.toString();
    }
    else if (isArrayLike(x)) {
        return str('#js/object {',
            Array.prototype.slice.call(x)
                .map(function(x, i) { return str(i, ' ', prStr(x)); })
                .join(', '), '}');
    }
    else {
        return "" + x;
    }
}
