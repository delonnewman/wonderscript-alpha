import { isString } from "../../js/predicates";
import { Keyword } from "../../lang/Keyword";
import { Symbol } from "../../lang/Symbol";
import { Form, isTaggedValue } from "../core";
import { escapeChars } from "../utils";
import { QUOTE_SYM } from "./emitQuote";

export function emitSlotName(slot: Form) {
  if (
    isTaggedValue(slot) &&
    slot[0].equals(QUOTE_SYM) &&
    slot[1] instanceof Symbol
  ) {
    slot = slot[1].name();
  }

  if (slot instanceof Keyword) {
    slot = slot.name();
  }

  if (isString(slot)) {
    return escapeChars(slot);
  }
}
