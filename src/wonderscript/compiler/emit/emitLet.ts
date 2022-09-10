import {Context} from "../../lang/Context";
import {escapeChars} from "../utils";
import {compileBody} from "./compileBody";
import {emit} from "../emit";
import {BodyForm, Form, isBodyForm} from "../core";
import {LET_SYM as LET_STR} from "../constants";
import {prStr} from "../prStr";
import {isSymbol, Symbol} from "../../lang/Symbol";

export const LET_SYM = Symbol.intern(LET_STR);

export type LetForm = BodyForm<typeof LET_SYM>;

export const isLetForm = isBodyForm<typeof LET_SYM>(LET_SYM);

export function emitLet(form: Form, scope: Context): string {
    if (!isLetForm(form)) throw new Error(`invalid ${LET_SYM} form: ${prStr(form)}`);

    const env = new Context(scope);

    if (form.length < 2) throw new Error('A let expression should have at least 2 elements');

    const buffer = ['(function('];
    const binds = form[1];
    const body = form.slice(2);

    // add names to function scope
    const names = [];
    for (let i = 0; i < binds.length; i += 2) {
        if (!isSymbol(binds[i])) throw new Error('binding names should be symbols');
        // TODO: should throw error for namespaced symbols
        env.define(binds[i], true);

        const bind = escapeChars(binds[i].name());
        names.push(bind);
    }

    buffer.push(names.join(', '));
    buffer.push('){');

    // body
    buffer.push(compileBody(body, env));
    buffer.push('}(');

    // add values to function scope
    const values = [];
    for (let i = 0; i < binds.length; i += 2) {
        values.push(emit(binds[i + 1], env));
    }

    buffer.push(values.join(', '));
    buffer.push('))');

    return buffer.join('');
}
