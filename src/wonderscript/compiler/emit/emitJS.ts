import {Form, isTaggedValue, TaggedValue} from "../core";
import {JS_SYM} from "../constants";
import {emitQuote, isQuoteForm} from "./emitQuote";
import {isString} from "../../lang/runtime";

type JSForm = TaggedValue<typeof JS_SYM>;

export const isJSForm = (form: any): form is JSForm =>
    isTaggedValue(form) && form[0] === JS_SYM;

export function emitJS(form: Form): string {
    if (!isJSForm(form)) throw Error("invalid form: " + JSON.stringify(form));

    if (isQuoteForm(form[1]) && isString(form[1][1])) {
        return emitQuote(form[1]);
    }

    return form[1];
}