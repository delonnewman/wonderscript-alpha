import {Form, isTaggedValue, TaggedValue} from "../core";
import {JS_SYM as JS_STR} from "../constants";
import {emitQuote, isQuoteForm, QuoteForm} from "./emitQuote";
import {isString} from "../../lang/runtime";
import {prStr} from "../prStr";
import {Symbol} from "../../lang/Symbol";

export const JS_SYM = Symbol.intern(JS_STR);

export type JSForm = [typeof JS_SYM, string | QuoteForm];

export const isJSForm = (form: Form): form is JSForm =>
    isTaggedValue(form) && form[0].equals(JS_SYM) && isString(form[1]) || isQuoteForm(form[1]);

export function emitJS(form: Form): string {
    if (!isJSForm(form)) throw Error(`invalid ${JS_SYM} form: ${prStr(form)}`);

    const quoted = form[1];
    if (isQuoteForm(quoted)) {
        return emitQuote(quoted);
    }

    return quoted;
}