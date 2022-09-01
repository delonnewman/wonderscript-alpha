import {readString} from "./readString";
import {emit} from "./emit";
import {Form, isTaggedValue} from "./core";
import {macroexpand} from "./macroexpand";
import {cons, isArray, map} from "../lang/runtime";
import {Env} from "./Env";
import {evaluate} from "../compiler";

function evalAll(seq: Form[], scope: Env): Form[] {
    const evaled = [];

    for (let i = 0; i < seq.length; i++) {
        const form = seq[i];
        evaluate(form, scope);
        evaled.push(form);
    }

    return evaled;
}


function expandMacros(form: Form, scope: Env) {
    if (!isArray(form)) {
        return form;
    }
    else if (isTaggedValue(form)) {
        const args = form.slice(1);
        return macroexpand(cons(form[0], args.map((arg) => expandMacros(arg, scope))) as Form, scope);
    }
    else {
        return map((x) => expandMacros(x, scope), form);
    }
}

function expandAllMacros(seq: Form[], scope: Env) {
    const expanded = [];
    for (let i = 0; i < seq.length; i++) {
        const form_= expandMacros(expandMacros(seq[i], scope), scope);
        expanded.push(form_);
    }
    return expanded;
}

export function compileString(s: string, scope: Env): string {
    const seq = expandAllMacros(evalAll(readString(s), scope), scope);
    const buffer = [];

    for (let i = 0; i < seq.length; i++) {
        buffer.push(emit(seq[i], scope));
    }

    return buffer.join(';\n');
}
