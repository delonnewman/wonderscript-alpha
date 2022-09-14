import {readDelimitedList} from "./readDelimitedList";
import {PushBackReader} from "./PushBackReader";
import {FN_SYM, FnForm} from "../compiler/emit/emitFunc";
import {isSymbol, Symbol} from "../lang/Symbol";
import {isInteger} from "../lang/runtime";
import {isTaggedValue} from "../compiler/core";

const FIRST_SYM = Symbol.intern('%');

const argNumber = (arg: Symbol): number | null => {
    if (FIRST_SYM.equals(arg)) return 1;
    const name = arg.name();

    const num = parseFloat(name.slice(1));
    if (!isInteger(num)) return null;

    return num;
}

function collectArgs(body): Symbol[] {
    const args = [];
    const forms = body.slice(0);

    while (forms.length !== 0) {
        const form = forms.shift();

        if (isSymbol(form) && form.name().startsWith('%')) {
            args.push(form);
        } else if (isTaggedValue(form)) {
            for (let x of form.slice(1)) {
                forms.push(x);
            }
        }
    }

    args.sort((a, b) => a.cmp(b));

    // remove duplicates && error check
    let index = 1;
    for (let i = 0; i < args.length; i++) {
        let num;
        if ((i > 0 && args[i].equals(args[i - 1])) || (num = argNumber(args[i])) == null) {
            args.splice(i, 1);
            index--; i--;
        } else if (num !== index) {
            throw new Error(`argument index (${args[i]}) is out of order should be %${index}`);
        }
        index++;
    }

    return args;
}

// TODO: Should throw an error if nested
export function fnReader(r: PushBackReader, leftbracket, opts): FnForm {
    const array = readDelimitedList(')', r, true, opts);
    const args  = collectArgs(array);

    return [FN_SYM, args, array];
}
