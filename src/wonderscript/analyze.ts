import { Form } from "./compiler/core";
import { Dialog, DialogMessage, DialogSubject, Dispatch } from "./lang/Dispatch";
import { Keyword } from "./lang/Keyword";
import { Hash } from "./lang/Hash";
import { Vector } from "./lang/Vector";
import { Array } from "./lang/Array";
import { Set } from "./lang/Set";
import { Symbol } from "./lang/Symbol";
import { prStr } from "./compiler/prStr";
import { Message } from "./lang/Message";
import {
  AND_SYM,
  BEGIN_SYM,
  BIT_AND_SYM,
  BIT_LSHIFT_SYM,
  BIT_NOT_SYM,
  BIT_OR_SYM,
  BIT_RSHIFT_SYM,
  BIT_URSHIFT_SYM,
  DEF_SYM,
  DIV_SYM,
  DO_SYM,
  EQUIV_SYM,
  GT_SYM,
  GTQ_SYM,
  IDENTICAL_SYM,
  INSTANCE_SYM,
  JS_AND,
  JS_BIT_AND,
  JS_BIT_LSHIFT,
  JS_BIT_NOT,
  JS_BIT_OR,
  JS_BIT_RSHIFT,
  JS_BIT_URSHIFT,
  JS_INSTANCE,
  JS_MOD,
  JS_NOT,
  JS_OR,
  JS_TYPEOF,
  LET_SYM,
  LT_SYM,
  LTQ_SYM,
  MINUS_SYM,
  MOD_SYM,
  MULT_SYM, NEW_SYM,
  NOT_EQUIV_SYM,
  NOT_IDENTICAL_SYM,
  NOT_SYM,
  OR_SYM,
  PLUS_SYM,
  SET_SYM,
  TYPE_SYM,
} from "./compiler/constants";
import { Eval } from "./lang/javascript/Eval";

export type SelfEvaluating = number | string | null | undefined | boolean | Symbol | Keyword;
export type Collection = Array | Hash | Set | Vector<Syntax>;
export type Syntax = Dispatch | Message | Collection | SelfEvaluating;

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
      case PLUS_SYM:
      case MINUS_SYM:
      case DIV_SYM:
      case MULT_SYM:
      case EQUIV_SYM:
      case IDENTICAL_SYM:
      case NOT_EQUIV_SYM:
      case NOT_IDENTICAL_SYM:
      case LT_SYM:
      case GT_SYM:
      case LTQ_SYM:
      case GTQ_SYM:
        return Eval.binaryOp(form[0].name, analyze(form[1]), analyze(form[2]));
      case MOD_SYM:
        return Eval.binaryOp(JS_MOD, analyze(form[1]), analyze(form[2]));
      case NOT_SYM:
        return Eval.unaryOp(JS_NOT, analyze(form[1]));
      case AND_SYM:
        return Eval.binaryOp(JS_AND, analyze(form[1]), analyze(form[2]));
      case OR_SYM:
        return Eval.binaryOp(JS_OR, analyze(form[1]), analyze(form[2]));
      case BIT_NOT_SYM:
        return Eval.unaryOp(JS_BIT_NOT, analyze(form[1]));
      case BIT_AND_SYM:
        return Eval.binaryOp(JS_BIT_AND, analyze(form[1]), analyze(form[2]));
      case BIT_OR_SYM:
        return Eval.binaryOp(JS_BIT_OR, analyze(form[1]), analyze(form[2]));
      case BIT_LSHIFT_SYM:
        return Eval.binaryOp(JS_BIT_LSHIFT, analyze(form[1]), analyze(form[2]));
      case BIT_RSHIFT_SYM:
        return Eval.binaryOp(JS_BIT_RSHIFT, analyze(form[1]), analyze(form[2]));
      case BIT_URSHIFT_SYM:
        return Eval.binaryOp(
          JS_BIT_URSHIFT,
          analyze(form[1]),
          analyze(form[2])
        );
      case NEW_SYM:
        return Eval.unaryOp(NEW_SYM, analyze(form[1]));
      case INSTANCE_SYM:
        return Eval.binaryOp(JS_INSTANCE, analyze(form[1]), analyze(form[2]));
      case TYPE_SYM:
        return Eval.unaryOp(JS_TYPEOF, analyze(form[1]));
      default:
        return new Dialog(
          analyze(form[0]) as DialogSubject,
          analyze(form.slice(1)) as DialogMessage
        );
    }
  }

  return new Dialog(analyze(form[0]) as DialogSubject, analyze(form.slice(1)) as DialogMessage)
}

export function analyzeHash(form: Hash){
  const hash = new Hash();

  for (const [key, value] of form.entries()) {
    hash.set(analyze(key), analyze(value));
  }

  return hash;
}