import {isArray, isString, map, str} from "../../lang/runtime";
import {emit} from "./index";
import {escapeChars} from "../utils";
import {Env} from "../Env";

export function emitObjectRes(form, env: Env): string {
    var obj = form[1], prop = form[2];
    if (isArray(prop)) {
        var method = prop[0], args = prop.slice(1);
        return str('(', emit(obj, env), ').', escapeChars(method), '(',
            map(function(x) { return emit(x, env); }, args).join(', '), ')');
    }
    else if (isString(prop)) {
        if (prop.startsWith('-')) {
            return str('(', emit(obj, env), ').', escapeChars(prop.slice(1)));
        }
        else {
            return str('(', emit(obj, env), ').', escapeChars(prop), '()');
        }
    }

    throw new Error("'.' form requires at least 3 elements");
}
