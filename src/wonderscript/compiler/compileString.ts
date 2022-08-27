import {readString} from "./readString";
import {emit} from "./emit/index";
import {evaluate, Form, isTaggedValue} from "./core";
import {macroexpand} from "./macroexpand";
import {cons, isArray, map} from "../lang/runtime";

function evalAll(seq: Form[]): Form[] {
    const evaled = [];

    for (let i = 0; i < seq.length; i++) {
        const form = seq[i];
        evaluate(form);
        evaled.push(form);
    }

    return evaled;
}


function expandMacros(form: Form) {
    if (!isArray(form)) {
        return form;
    }
    else if (isTaggedValue(form)) {
        const args = form.slice(1);
        return macroexpand(cons(form[0], args.map(expandMacros)) as Form);
    }
    else {
        return map(expandMacros, form);
    }
}

function expandAllMacros(seq: Form[]) {
    const expanded = [];
    for (let i = 0; i < seq.length; i++) {
        const form_= expandMacros(expandMacros(seq[i]));
        expanded.push(form_);
    }
    return expanded;
}

export function compileString(s) {
    const seq = expandAllMacros(evalAll(readString(s)));
    const buffer = [];

    for (let i = 0; i < seq.length; i++) {
        buffer.push(emit(seq[i]));
    }

    return buffer.join(';\n');
}
