import { Form } from "./compiler/core";
import { Dialog, DialogMessage, DialogSubject, Dispatch } from "./lang/Dispatch";
import { Keyword } from "./lang/Keyword";
import { Hash } from "./lang/Hash";
import { Vector } from "./lang/Vector";
import { Array as WSArray } from "./lang/Array";
import { Set as WSSet } from "./lang/Set";
import { Symbol } from "./lang/Symbol";
import { prStr } from "./compiler/prStr";
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
import { Variable } from "./lang/Dispatch/Variable";
import { Identity } from "./lang/Dispatch/Identity";
import { HashDispatch } from "./lang/Dispatch/HashDispatch";
import { SetDispatch } from "./lang/Dispatch/SetDispatch";
import { VectorDispatch } from "./lang/Dispatch/VectorDispatch";
import { ArrayDispatch } from "./lang/Dispatch/ArrayDispatch";
import { UnaryMessage } from "./lang/Message/UnaryMessage";
import { BinaryMessage } from "./lang/Message/BinaryMessage";
import { ArgListMessage } from "./lang/Message/ArgListMessage";

export type SelfEvaluating = number | string | null | undefined | boolean | Symbol | Keyword;

export function isSelfEvaluating(form: Form): form is SelfEvaluating {
  return (
    form === null ||
    form === undefined ||
    typeof form === "number" ||
    typeof form === "string" ||
    typeof form === "boolean" ||
    form instanceof Keyword
  );
}

export function analyze(form: Form): Dispatch {
  if (isSelfEvaluating(form)) {
    return new Identity(form);
  }

  if (form instanceof Symbol) {
    return new Variable(form);
  }

  if (form instanceof Hash || form instanceof Map) {
    return analyzeHash(form);
  }

  if (form instanceof WSSet || form instanceof Set) {
    return new SetDispatch(new WSSet(Array.prototype.map.call(form, analyze)));
  }

  if (form instanceof Vector) {
    return new VectorDispatch(new Vector(Array.prototype.map.call(form, analyze)));
  }

  if (!WSArray.isArray(form) && !Array.isArray(form)) {
    throw new Error(`unknown form: ${prStr(form)}`);
  }

  if (form.length < 2) {
    return new ArrayDispatch(form.map(analyze) as WSArray);
  }

  if (form[1] instanceof Symbol) {
    switch (form[1].name) {
      case DEF_SYM:
      // send "define/2" message to the specified object
      // return new Dialog(form[1], new ArgListMessage("define", form[2], analyze(form[2])))
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
        return Eval.binaryOp(form[1].name, analyze(form[0]), analyze(form[2]));
      case MOD_SYM:
        return Eval.binaryOp(JS_MOD, analyze(form[0]), analyze(form[2]));
      case NOT_SYM:
        return Eval.unaryOp(JS_NOT, analyze(form[0]));
      case AND_SYM:
        return Eval.binaryOp(JS_AND, analyze(form[0]), analyze(form[2]));
      case OR_SYM:
        return Eval.binaryOp(JS_OR, analyze(form[0]), analyze(form[2]));
      case BIT_NOT_SYM:
        return Eval.unaryOp(JS_BIT_NOT, analyze(form[0]));
      case BIT_AND_SYM:
        return Eval.binaryOp(JS_BIT_AND, analyze(form[0]), analyze(form[2]));
      case BIT_OR_SYM:
        return Eval.binaryOp(JS_BIT_OR, analyze(form[0]), analyze(form[2]));
      case BIT_LSHIFT_SYM:
        return Eval.binaryOp(JS_BIT_LSHIFT, analyze(form[0]), analyze(form[2]));
      case BIT_RSHIFT_SYM:
        return Eval.binaryOp(JS_BIT_RSHIFT, analyze(form[0]), analyze(form[2]));
      case BIT_URSHIFT_SYM:
        return Eval.binaryOp(
          JS_BIT_URSHIFT,
          analyze(form[0]),
          analyze(form[2])
        );
      case NEW_SYM:
        return Eval.unaryOp(NEW_SYM, analyze(form[0]));
      case INSTANCE_SYM:
        return Eval.binaryOp(JS_INSTANCE, analyze(form[0]), analyze(form[2]));
      case TYPE_SYM:
        return Eval.unaryOp(JS_TYPEOF, analyze(form[0]));
      default:
        if (form.length === 2) {
          return new Dialog(
            analyze(form[0]) as DialogSubject,
            new UnaryMessage(form[1].name, form[1].namespace)
          );
        }
        if (form.length === 3) {
          return new Dialog(
            analyze(form[0]) as DialogSubject,
            new BinaryMessage(form[1].name, form[1].namespace, analyze(form[2]))
          );
        }
        return new Dialog(
          analyze(form[0]) as DialogSubject,
          new ArgListMessage(
            form[1].name,
            form[1].namespace,
            form.slice(2).map(analyze)
          )
        );
    }
  }

  return new Dialog(analyze(form[0]) as DialogSubject, analyze(form.slice(1)) as DialogMessage)
}

export function analyzeHash(form: Map<Form, Form>) {
  const hash = new Hash();

  for (const [key, value] of form.entries()) {
    hash.set(analyze(key), analyze(value));
  }

  return new HashDispatch(hash);
}