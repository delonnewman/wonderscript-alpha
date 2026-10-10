import { Form } from "./compiler/core";
import {
  Binding,
  Dialog,
  Dispatch,
  DispatchSubject, Script,
} from "./lang/Dispatch";
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
  QUOTE_SYM,
  TYPE_SYM,
} from "./compiler/constants";
import { Variable } from "./lang/Dispatch/Variable";
import { Identity } from "./lang/Dispatch/Identity";
import { HashDispatch } from "./lang/Dispatch/HashDispatch";
import { SetDispatch } from "./lang/Dispatch/SetDispatch";
import { VectorDispatch } from "./lang/Dispatch/VectorDispatch";
import { ArrayDispatch } from "./lang/Dispatch/ArrayDispatch";
import { UnaryMessage } from "./lang/Message/UnaryMessage";
import { BinaryMessage } from "./lang/Message/BinaryMessage";
import { ArgListMessage } from "./lang/Message/ArgListMessage";
import { isReadForm, ReadForm } from "./reader";
import { MetaData } from "./lang/Meta";
import { Message, MessageForm } from "./lang/Message";
import { partition } from "./lang/runtime";
import { ObjectPool } from "./lang/ObjectPool";
import { Context } from "./lang/Context";

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

export function analyze(initForm: ReadForm | Form): Dispatch {
  let meta: MetaData | undefined, form: Form;
  if (isReadForm(initForm)) {
    meta = new Map([
      [Keyword.intern("line"), initForm.line],
      [Keyword.intern("column"), initForm.column]
    ]);
    form = initForm.form;
  } else {
    form = initForm;
  }

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
    const array = Array.from(form).map(analyze)
    return new SetDispatch(new WSSet(array));
  }

  if (form instanceof Vector) {
    const array = Array.prototype.map.call(form, analyze);
    return new VectorDispatch(new Vector(...array));
  }

  if (!WSArray.isArray(form) && !Array.isArray(form)) {
    throw new Error(`unknown form: ${prStr(form)}`);
  }

  if (form.length < 2) {
    return new ArrayDispatch(form.map(analyze) as WSArray);
  }

  if (form[0] instanceof Symbol) {
    switch (form[0].name) {
      case DEF_SYM:
        return analyzeDef(form, meta);
      case BEGIN_SYM:
        return analyzeBlock(form, meta, false);
      case DO_SYM:
        return analyzeBlock(form, meta, true);
      case QUOTE_SYM:
        return new Identity(form[1]);
    }
  }

  if (form[1] instanceof Symbol) {
    switch (form[1].name) {
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
        return new Dialog(
          analyze(form[0]) as DispatchSubject,
          BinaryMessage.jsOp(form[1].name, analyze(form[2])),
          meta
        )
      case MOD_SYM:
        return new Dialog(
          analyze(form[0]) as DispatchSubject,
          BinaryMessage.jsOp(JS_MOD, analyze(form[2])),
          meta
        );
      case NOT_SYM:
        return new Dialog(
          analyze(form[0]) as DispatchSubject,
          UnaryMessage.jsOp(JS_NOT),
          meta
        );
      case AND_SYM:
        return new Dialog(
          analyze(form[0]) as DispatchSubject,
          BinaryMessage.jsOp(JS_AND, analyze(form[2])),
          meta
        );
      case OR_SYM:
        return new Dialog(
          analyze(form[0]) as DispatchSubject,
          BinaryMessage.jsOp(JS_OR, analyze(form[2])),
          meta
        );
      case BIT_NOT_SYM:
        return new Dialog(
          analyze(form[0]) as DispatchSubject,
          UnaryMessage.jsOp(JS_BIT_NOT),
          meta
        );
      case BIT_AND_SYM:
        return new Dialog(
          analyze(form[0]) as DispatchSubject,
          BinaryMessage.jsOp(JS_BIT_AND, analyze(form[2])),
          meta
        );
      case BIT_OR_SYM:
        return new Dialog(
          analyze(form[0]) as DispatchSubject,
          BinaryMessage.jsOp(JS_BIT_OR, analyze(form[2])),
          meta
        );
      case BIT_LSHIFT_SYM:
        return new Dialog(
          analyze(form[0]) as DispatchSubject,
          BinaryMessage.jsOp(JS_BIT_LSHIFT, analyze(form[2])),
          meta
        );
      case BIT_RSHIFT_SYM:
        return new Dialog(
          analyze(form[0]) as DispatchSubject,
          BinaryMessage.jsOp(JS_BIT_RSHIFT, analyze(form[2])),
          meta
        );
      case BIT_URSHIFT_SYM:
        return new Dialog(
          analyze(form[0]) as DispatchSubject,
          BinaryMessage.jsOp(JS_BIT_URSHIFT, analyze(form[2])),
          meta
        );
        // TODO: A message that is sent to js/Function objects
      case NEW_SYM:
        return new Dialog(
          analyze(form[0]) as DispatchSubject,
          UnaryMessage.jsOp(NEW_SYM),
          meta
        );
        // TODO: A message that is sent to js/Object objects
      case INSTANCE_SYM:
        return new Dialog(
          analyze(form[0]) as DispatchSubject,
          BinaryMessage.jsOp(JS_INSTANCE, analyze(form[2])),
          meta
        );
        // TODO: A message that is sent to js/Value objects
      case TYPE_SYM:
        return new Dialog(
          analyze(form[0]) as DispatchSubject,
          UnaryMessage.jsOp(JS_TYPEOF),
          meta
        );
      default:
        if (form.length === 2) {
          return new Dialog(
            analyze(form[0]) as DispatchSubject,
            new UnaryMessage(form[1].name, form[1].namespace),
            meta
          );
        }
        if (form.length === 3) {
          return new Dialog(
            analyze(form[0]) as DispatchSubject,
            new BinaryMessage(form[1].name, form[1].namespace, analyze(form[2])),
            meta
          );
        }
        return new Dialog(
          analyze(form[0]) as DispatchSubject,
          new ArgListMessage(
            form[1].name,
            form[1].namespace,
            form.slice(2).map(analyze)
          ),
          meta
        );
    }
  }

  return new Dialog(
    analyze(form[0]) as DispatchSubject,
    Message.build(form.slice(1) as MessageForm),
    meta
  )
}

export function analyzeHash(form: Map<Form, Form>) {
  const hash = new Hash();

  for (const [key, value] of form.entries()) {
    hash.set(analyze(key), analyze(value));
  }

  return new HashDispatch(hash);
}

export function analyzeBlock(form: unknown[], meta: MetaData | undefined, delay: boolean) {
  const binds: Binding[] = [];
  let restIdx = 1;

  if (form[1] instanceof Vector) {
    restIdx = 2;
    const pairs = partition<Form>(2, form[1]);
    for (const pair of pairs) {
      if (pair[0] instanceof Symbol) {
        binds.push(new Binding(pair[0], analyze(pair[1])));
      }
    }
  }

  const actions = form.slice(restIdx).map(analyze);
  const script = new Script(actions, binds, meta);
  if (!delay) {
    return script;
  }

  return {
    script,
    dispatch(pool: ObjectPool, ctx: Context): unknown {
      return this.script;
    },
  };
}

// (def (self to_s) "Hi!")
// (def (self "Hi") "Hi! How are you?")
export function analyzeDef(form: unknown[], meta: MetaData | undefined): Dispatch {
  if (form.length !== 3) {
    throw new Error(`invalid def form expected 3 elements, got ${form.length} instead`);
  }

  const def = form[1];
  const body = form[2];

  if (!(def instanceof Array)) {
    throw new Error(`invalid def form expected array, got ${prStr(def)} instead`);
  }
  const [obj, template] = def;

  return new Dialog(
    new Dialog(analyze(obj), new UnaryMessage('class')),
    new ArgListMessage(
      "define-method",
      undefined,
      [
        template,
        body,
      ]
    )
  );
}
