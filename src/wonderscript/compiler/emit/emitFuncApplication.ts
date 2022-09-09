import {emit} from "../emit";
import {Context} from "../../lang/Context";
import {isSymbol} from "../../lang/Symbol";
import {isMacro} from "../core";

// @ts-ignore
Array.prototype.invoke = function(index: number) {
    return this[index];
};

// @ts-ignore
Map.prototype.invoke = function(key) {
    return this.get(key);
};

// @ts-ignore
Set.prototype.invoke = function(val): boolean {
    return this.has(val);
};

// @ts-ignore
Function.prototype.invoke = function(...args) {
    return this.call(this, ...args);
};

export function emitFuncApplication(form, env: Context): string {
    if (isSymbol(form[0]) && isMacro(form[0])) {
        throw new Error('Macros cannot be evaluated in this context');
    }

    const fn = emit(form[0], env);
    const args = form.slice(1, form.length);
    const argBuffer = [];

    for (let i = 0; i < args.length; i++) {
        argBuffer.push(emit(args[i], env));
    }

    return `(${fn}).invoke(${argBuffer.join(', ')})`;
}
