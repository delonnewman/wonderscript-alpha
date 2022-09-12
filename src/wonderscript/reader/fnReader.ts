import {readDelimitedList} from "./readDelimitedList";
import {PushBackReader} from "./PushBackReader";
import {FN_SYM, FnForm} from "../compiler/emit/emitFunc";
import {isSymbol, Symbol} from "../lang/Symbol";
import {isArray, isInteger} from "../lang/runtime";

const FIRST_SYM = Symbol.intern('%');

const argNumber = (arg: Symbol): number | null => {
    if (!isSymbol(arg)) return null;
    if (FIRST_SYM.equals(arg)) return 0;

    const name = arg.name();
    if (!name.startsWith('%')) return null;

    const num = parseFloat(name.slice(1));
    if (!isInteger(num)) return null;

    return num;
}

function collectArgs(body): Symbol[] {
    const args = [];

    for (let form of body) {
        if (isSymbol(form) && form.name().startsWith('%')) {
            args.push(form);
        }
        if (isArray(form)) {
            args.push.apply(args, collectArgs(form));
        }
    }

    const names = args.sort((a, b) => a.cmp(b));

    for (let i = 0; i < names.length; i++) {
        const num = argNumber(names[i]);
        if (num == null) {
            names.splice(i, 1);
        } else if (num !== i) {
            names.splice(i, 0, Symbol.intern(`%${i}`));
        }
    }

    return names;
}

export function fnReader(r: PushBackReader, leftbracket, opts): FnForm {
    const array = readDelimitedList(')', r, true, opts);
    const args  = collectArgs(array);

    return [FN_SYM, args, array];
}
