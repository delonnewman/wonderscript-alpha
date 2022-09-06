import {emit} from "../emit";
import {Env} from "../Env";
import {Form, isTaggedValue} from "../core";
import {prStr} from "../prStr";

export function emitVariableOp(form: Form, env: Env, op = form[0]): string {
    if (!isTaggedValue(form)) throw new Error(`invalid variable operator form: ${prStr(form)}`);
    // TODO: For now we'll throw and error, but eventually we may want to provide
    //  an alternate dispatch for these cases.
    if (form.length < 3) throw new Error(`variable operators must have a least 2 arguments`);

    const values = form.slice(1, form.length);
    const valBuffer = [];

    for (let i = 0; i < values.length; ++i) {
        valBuffer.push(emit(values[i], env));
    }

    return `(${valBuffer.join(op)})`;
}
