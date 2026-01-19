import { isString } from "../../js/predicates";
import { isKeyword, Keyword } from "../../lang/Keyword";
import { isSymbol } from "../../lang/Symbol";
import { Form, isTaggedValue } from "../core";
import { escapeChars } from "../utils";
import { QUOTE_SYM } from "./emitQuote";

export function emitSlotName(slot: Form) {
  if (isTaggedValue(slot) && slot[0].equals(QUOTE_SYM) && isSymbol(slot[1])) {
    slot = slot[1].name();
  }

  if (isKeyword(slot)) {
    slot = slot.name();
  }

  if (isString(slot)) {
    return escapeChars(slot);
  }
}
