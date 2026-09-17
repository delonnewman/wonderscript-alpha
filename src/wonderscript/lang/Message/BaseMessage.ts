import { Message, MessageArgs, Obj } from "../Message";
import { escapeChars } from "../../compiler/utils";
import { Keyword } from "../Keyword";
import { prStr } from "../../compiler";
import { Vector } from "../Vector";
import { BoundMessage } from "./BoundMessage";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emit } from "../../compiler/emit";

const EMPTY_ARRAY = Object.freeze([]);

export class BaseMessage implements Message {
  #name: string;
  #namespace?: string;
  #args: MessageArgs;
  #ident: string;
  #withinQuery: boolean;

  constructor(
    name: string,
    namespace?: string,
    args: MessageArgs = EMPTY_ARRAY,
    flags: { withinQuery?: boolean } = {}
  ) {
    this.#name = name;
    this.#namespace = namespace;
    this.#args = Array.from(args);
    this.#ident = namespace === "js" ? name : `${name}_${args.length}`;
    this.#withinQuery = flags?.withinQuery ?? false;
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

  isWithinQuery(): boolean {
    return this.#withinQuery;
  }

  withinQuery(): Message {
    if (this.#withinQuery) {
      return this;
    }

    return new (this.constructor as typeof BaseMessage)(this.name, this.namespace, this.args, {
      withinQuery: true,
    });
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

  withArgs(args: unknown[]) {
    return new (this.constructor as typeof BaseMessage)(this.name, this.namespace, args);
  }

  hasSplatArgs() {
    return this.arity < 0;
  }

  bind(obj: Obj): BoundMessage {
    return new BoundMessage(this, obj);
  }

  sendTo(obj: Obj): unknown {
    const fn = obj[this.interned];
    if (typeof fn === "function") {
      return fn.apply(obj, this.args);
    }

    throw new Error(`unknown message ${this}`);
  }

  toJS(ctx: Context, obj: Form): string {
    const args = this.args.map((it) => emit(it, ctx));
    return `${emit(obj, ctx)}.${this.interned}(${args.join(", ")})`;
  }
}
