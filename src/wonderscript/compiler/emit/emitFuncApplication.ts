import {emit} from "../emit";
import {Context} from "../../lang/Context";
import {isSymbol} from "../../lang/Symbol";
import {isMacro} from "../core";
import {prStr} from "../prStr";

// @ts-ignore
Array.prototype.invoke = function(indexes: number[]) {
    if (indexes.length === 0) {
        return null;
    }

    if (indexes.length === 1) {
        return this[indexes[0]];
    }

    return indexes.map(idx => this[idx]);
};

// @ts-ignore
Map.prototype.invoke = function(keys: any[]) {
    if (keys.length === 0) {
        return null;
    }

    if (keys.length === 1) {
        return this.get(keys[0]);
    }

    return keys.map((k) => this.get(k));
};

// @ts-ignore
Set.prototype.invoke = function(args: any[]): boolean {
    if (args.length === 0) {
        return false;
    }

    if (args.length === 1) {
        return this.has(args[0]);
    }

    args.every((v) => this.has(v));
};

// @ts-ignore
Function.prototype.invoke = function(args: any[]) {
    return this.apply(this, args);
};

export function emitFuncApplication(form, env: Context): string {
    if (isSymbol(form[0]) && isMacro(form[0])) {
        throw new Error(`macros cannot be evaluated in this context: ${prStr(form)}`);
    }

    const fn = emit(form[0], env);
    const args = form.slice(1, form.length);
    const argBuffer = [];

    for (let i = 0; i < args.length; i++) {
        argBuffer.push(emit(args[i], env));
    }

    return `(${fn}).invoke([${argBuffer.join(', ')}])`;
}
