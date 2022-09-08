import {readDelimitedList} from "./readDelimitedList";
import {PushBackReader} from "./PushBackReader";
import {QUOTE_SYM, QuoteForm} from "../compiler/emit/emitQuote";

export function vectorReader(r: PushBackReader, openbracket, opts): QuoteForm {
    const a = readDelimitedList(']', r, true, opts);

    return [QUOTE_SYM, a]
}
