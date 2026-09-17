import { prStr } from "../compiler";
import { Keyword, Vector, Symbol } from "../lang";
import { escapeChars } from "../compiler/utils";
import { Form, TaggedValue } from "../compiler/core";
import { Context } from "./Context";
import { emit } from "../compiler/emit";
import { emitSlotName } from "../compiler/emit/slots";

export type MessageForm =
  string | Keyword | [Keyword, ...unknown[]] | Vector<unknown>;

export function isMessageForm(form: unknown): form is MessageForm {
  return (
    typeof form === "string" ||
    form instanceof Keyword ||
    Array.isArray(form) ||
    form instanceof Vector
  );
}

type Obj = {
  [key: string]: unknown;
};

type MessageArgs = unknown[] | readonly unknown[] | Vector;

const EMPTY_ARRAY = Object.freeze([]);
export const JS_DIG_KW = Keyword.intern("prop", "js");
export const RESPOND_TO_KW = Keyword.intern("respond-to?");
export const JS_PROP_SET = Keyword.intern("set!", "js");

export class Message {
  static send(obj: Record<string, unknown>, msg: MessageForm) {
    return this.build(msg).sendTo(obj);
  }

  static toJS(ctx: Context, msg: MessageForm, obj: Form) {
    return this.build(msg).toJS(ctx, obj);
  }

  static build(msg: MessageForm): Message {
    // console.error('building message from', prStr(msg))
    if (msg instanceof Vector || Array.isArray(msg)) {
      return Message.compound(msg);
    }

    if (msg instanceof Keyword || typeof msg === "string") {
      return Message.simple(msg);
    }

    throw new Error(
      `message form expected vector or array, got ${prStr(msg)} instead`
    );
  }

  static compound(msg: unknown[] | Vector): Message {
    if (msg.length === 0) {
      throw new Error(`invalid arguments expected at least 1, got 0 instead`);
    }

    let name: string, ns: string | undefined;
    const tag = msg[0];
    if (tag instanceof Keyword) {
      name = tag.name();
      ns = tag.namespace();
    } else if (typeof tag === "string") {
      name = tag;
    } else {
      throw new Error(
        `invalid tag expected keyword or string, got ${prStr(tag)} instead`
      );
    }

    if (name === "respond-to?") {
      return new RespondToMessage(name, ns, msg.slice(1));
    }

    if (ns === "js") {
      if (name === "prop") {
        if (msg.length < 2) {
          throw new Error(
            `invalid arguments expected at least 2, got ${msg.length} instead`
          );
        }

        return new JSPropMessage(name, ns, msg.slice(1));
      }

      if (name === "set!") {
        if (msg.length < 2) {
          throw new Error(
            `invalid arguments expected at least 2, got ${msg.length} instead`
          );
        }

        return new JSSetPropMessage(name, ns, msg.slice(1));
      }

      return new JSMethodMessage(name, ns, msg.slice(1));
    }

    return new this(name, ns, msg.slice(1));
  }

  static simple(msg: Keyword | string) {
    if (msg instanceof Keyword) {
      if (msg.namespace() === "js.prop") {
        // console.error('building message:', prStr(msg));
        return new JSPropMessage("prop", "js", [msg.name()]);
      }

      if (msg.namespace() === "js") {
        return new JSMethodMessage(msg.name(), msg.namespace());
      }

      return new this(msg.name(), msg.namespace());
    }

    if (typeof msg === "string") {
      return new this(msg);
    }

    throw new Error(
      `message form expected keyword or string, got ${prStr(msg)} instead`
    );
  }

  #name: string;
  #namespace?: string;
  #args: MessageArgs;
  #ident: string;

  constructor(
    name: string,
    namespace?: string,
    args: MessageArgs = EMPTY_ARRAY
  ) {
    this.#name = name;
    this.#namespace = namespace;
    this.#args = Array.from(args);
    this.#ident = namespace === "js" ? name : `${name}_${args.length}`;
    Object.freeze(this);
  }

  get name() {
    return this.#name;
  }

  get namespace() {
    return this.#namespace;
  }

  get ident(): string {
    return this.#ident;
  }

  get interned(): string {
    return escapeChars(this.ident);
  }

  get arity(): number {
    return this.#args.length;
  }

  get args() {
    return this.#args;
  }

  keyword() {
    return Keyword.intern(this.name, this.namespace);
  }

  toString() {
    if (this.args.length === 0) {
      return prStr(Keyword.intern(this.name, this.namespace));
    }
    return prStr(
      new Vector(Keyword.intern(this.name, this.namespace), ...this.args)
    );
  }

  sendTo(obj: Obj): unknown {
    const fn = obj[this.interned];
    if (typeof fn === "function") {
      return fn.apply(obj, this.args);
    }

    console.log(
      `unknown message ${this}`,
      this.interned,
      prStr(obj),
      Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
    );
    throw new Error(`unknown message ${this}`);
  }

  toJS(ctx: Context, obj: Form): string {
    const args = this.args.map((it) => emit(it, ctx));
    return `${emit(obj, ctx)}.${this.interned}(${args.join(", ")})`;
  }
}

export class JSPropMessage extends Message {
  toString(): string {
    if (this.args.length === 0) {
      return prStr(Keyword.intern(this.name, this.namespace));
    }
  }

  sendTo(obj: Obj): unknown {
    const args = Array.from(this.args).map((it) =>
      it instanceof Keyword ? escapeChars(it.name()) : escapeChars(`${it}`)
    );

    let val: unknown = obj;
    while (args.length > 0) {
      val = val[args.shift()!];
    }

    return val;
  }

  toJS(ctx: Context, obj: Form): string {
    const str = this.args
      .map((prop) => {
        const name =
          prop instanceof Keyword || typeof prop === "string"
            ? emitSlotName(prop)
            : emit(prop, ctx);
        return name !== undefined ? `.${name}` : `[${emit(prop, ctx)}]`;
      })
      .join("");

    // console.error('compiling message:', str, this.name, this.namespace);

    return `${emit(obj, ctx)}${str}`;
  }
}

export class JSMethodMessage extends Message {
  get ident(): string {
    return this.name;
  }
}

export class RespondToMessage extends Message {
  get query(): Message | Form {
    if (isMessageForm(this.args[0])) {
      return Message.build(this.args[0]);
    }

    return this.args[0];
  }

  sendTo(obj: Obj): boolean {
    const query = this.query;
    if (query instanceof Message) {
      return query.interned in obj;
    }

    throw new Error(`invalid method query: ${prStr(query)}`);
  }

  toJS(ctx: Context, obj: Form): string {
    const query = this.query;
    if (query instanceof Message) {
      return `("${query.interned}" in ${emit(obj, ctx)})`;
    }

    return `wonderscript.lang.Message.send(${emit(obj, ctx)}, [${emit(query as Form, ctx)}])`;
  }
}

export class JSSetPropMessage extends JSMethodMessage {
  get key(): unknown {
    const key = this.args[0];

    if (key instanceof Keyword) {
      return escapeChars(key.name());
    } else if (typeof key === "string") {
      return escapeChars(key);
    }

    return key;
  }

  get value(): unknown {
    return this.args[1];
  }

  sendTo(obj: Obj): Obj {
    obj[`${this.key}`] = this.value;
    return obj;
  }

  toJS(ctx: Context, obj: Form): string {
    const key = this.key;
    if (typeof key === "string") {
      return `${emit(obj, ctx)}.${this.key}=${emit(this.value as Form, ctx)}`;
    } else {
      return `wonderscript.lang.Message.send(${emit(obj, ctx)}, [${this.keyword().toJS()}, ${emit(key as Form, ctx)}, ${emit(this.value as Form, ctx)}])`;
    }
  }
}
