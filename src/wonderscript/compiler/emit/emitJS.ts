import {Form, isTaggedValue, TaggedValue} from "../core";
import {JS_SYM} from "../constants";
import {emitQuote, isQuoteForm, QuoteForm} from "./emitQuote";
import {isString} from "../../lang/runtime";
import {prStr} from "../prStr";

export type JSForm = [typeof JS_SYM, string | QuoteForm];

export const isJSForm = (form: Form): form is JSForm =>
    isTaggedValue(form) && form[0] === JS_SYM && isString(form[1]) || isQuoteForm(form[1]);

export function emitJS(form: Form): string {
    if (!isJSForm(form)) throw Error(`invalid ${JS_SYM} form: ${prStr(form)}`);

    const quoted = form[1];
    if (isQuoteForm(quoted)) {
        return emitQuote(quoted);
    }

    return quoted;
}