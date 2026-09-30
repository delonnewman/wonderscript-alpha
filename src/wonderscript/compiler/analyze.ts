import { Form } from "./core";
import { Dialog, Dispatch, Script } from "../lang/Dispatch";
import { Keyword } from "../lang/Keyword";
import { Hash } from "../lang/Hash";
import { Vector } from "../lang/Vector";
import { Array } from "../lang/Array";
import { Set } from "../lang/Set";
import { Symbol } from "../lang/Symbol";
import { prStr } from "./prStr";
import { Message, MessageForm } from "../lang/Message";
import { BEGIN_SYM, DEF_SYM, DO_SYM, LET_SYM, SET_SYM } from "./constants";

export type SelfEvaluating = number | string | null | undefined | boolean | Symbol | Keyword;
export type Collection = Array | Hash | Set | Vector<Syntax>;
export type Syntax = Dispatch | Collection | SelfEvaluating;

export function isSelfEvaluating(form: Form): form is SelfEvaluating {
  return (
    form === null ||
    form === undefined ||
    typeof form === "number" ||
    typeof form === "string" ||
    typeof form === "boolean" ||
    form instanceof Symbol ||
    form instanceof Keyword
  );
}

export function analyze(form: Form): Syntax {
  if (isSelfEvaluating(form)) {
    return form;
  }

  if (form instanceof Hash) {
    return analyzeHash(form);
  }

  if (form instanceof Set) {
    return new Set(Array.prototype.map.call(form, analyze));
  }

  if (form instanceof Vector) {
    return form.map<Syntax>(analyze);
  }

  if (!Array.isArray(form)) {
    throw new Error(`unknown form: ${prStr(form)}`);
  }

  if (form.length === 0) {
    return form as Array;
  }

  if (form[0] instanceof Symbol) {
    switch (form[0].name) {
      case DEF_SYM:
        // send "define/2" message to current package
        // return new Dialog(CURRENT_NS, new ArgListMessage("define", form[1], analyze(form[2])))
      case LET_SYM:
        // build Script object and dispatch
      case BEGIN_SYM:
        // build Script object and dispatch
      case DO_SYM:
        // build Script object and return
      case SET_SYM:
        // send "set/2" to the current environment
    }
  }

  return new Dialog(analyze(form[0]), Message.build(form.slice(1).map(analyze) as MessageForm))
}

export function analyzeHash(form: Hash){
  const hash = new Hash();

  for (const [key, value] of form.entries()) {
    hash.set(analyze(key), analyze(value));
  }

  return hash;
}