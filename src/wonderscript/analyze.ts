import { Form } from "./compiler/core";
import {
  Binding,
  Dialog,
  Dispatch,
  DispatchSubject, isDispatch, Script,
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
  LET_SYM,
  LT_SYM,
  LTQ_SYM,
  MINUS_SYM,
  MOD_SYM,
  MULT_SYM,
  NEW_SYM,
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
import { pt } from "./util";
import { Block } from "./lang/Dispatch/Block";

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

  if (form.length < 1) {
    return new ArrayDispatch(form.map(analyze) as WSArray);
  }

  if (form[0] instanceof Symbol) {
    switch (form[0].name) {
      case DEF_SYM:
        return analyzeDef(form, meta);
      case LET_SYM:
        return analyzeLet(form, meta);
      case BEGIN_SYM:
        return analyzeBegin(form, meta);
      case DO_SYM:
        return analyzeBlock(form, meta);
      case QUOTE_SYM:
        return new Identity(form[1]);
    }
  }

  if (form[1] instanceof Symbol) {
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
        new BinaryMessage(
          form[1].name,
          form[1].namespace,
          analyze(form[2])
        ),
        meta
      );
    }

    const dialog = new Dialog(
      analyze(form[0]) as DispatchSubject,
      new ArgListMessage(
        form[1].name,
        form[1].namespace,
        form.slice(2).map(analyze)
      ),
      meta
    );
    return dialog;
  }

  const rest = form.slice(1);
  const msg = rest.length > 0 && rest[0] instanceof Symbol
    ? Message.build(rest as MessageForm)
    : new WSArray(...rest);

  return new Dialog(
    analyze(form[0]) as DispatchSubject,
    msg,
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

export function analyzeLet(form: unknown[], meta: MetaData | undefined) {
  const binds: Binding[] = [];

  if (form[1] instanceof Vector) {
    const pairs = partition<Form>(2, form[1]);
    for (const pair of pairs) {
      if (pair[0] instanceof Symbol) {
        binds.push(new Binding(pair[0], analyze(pair[1])));
      }
    }
  } else {
    throw new Error(`invalid let form expected vector, got ${prStr(form[1])} instead`);
  }

  const actions = form.slice(2).map(analyze);
  return new Script(actions, binds, meta);
}

export function analyzeBegin(form: unknown[], meta: MetaData | undefined) {
  const binds: Binding[] = [];
  const actions = form.slice(1).map(analyze);
  return new Script(actions, binds, meta);
}

export function analyzeBlock(form: unknown[], meta: MetaData | undefined) {
  const binds: Binding[] = [];
  let restIdx = 1;

  if (form[1] instanceof Vector) {
    restIdx = 2;
    for (const sym of form[1]) {
      if (sym instanceof Symbol) {
        binds.push(new Binding(sym, null));
      }
    }
  }

  const actions = form.slice(restIdx).map(analyze);
  return Block.fromActions(actions, binds, meta);
}

// (def (self to_s) "Hi!")
// (def (self "Hi") "Hi! How are you?")
export function analyzeDef(form: unknown[], meta: MetaData | undefined): Dispatch {
  if (form.length !== 3) {
    throw new Error(`invalid def form expected 3 elements, got ${form.length} instead`);
  }

  const def = form[1];
  const body = Block.fromActions(form.slice(2).map(analyze));

  if (!(def instanceof Array)) {
    throw new Error(`invalid def form expected array, got ${prStr(def)} instead`);
  }
  const [obj, template] = def;

  return new Dialog(
    analyze(obj),
    new ArgListMessage(
      "define-method",
      undefined,
      [
        new Identity(template),
        body,
      ]
    )
  );
}
