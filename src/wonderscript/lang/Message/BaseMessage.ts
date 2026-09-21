import {
  Message,
  MessageArgs,
  MessageFlags,
  MessageForm,
  Obj,
} from "../Message";
import { escapeChars } from "../../compiler/utils";
import { Keyword } from "../Keyword";
import { Symbol } from "../Symbol";
import { prStr } from "../../compiler";
import { Vector } from "../Vector";
import { BoundMessage } from "./BoundMessage";
import { Context } from "../Context";
import { Form } from "../../compiler/core";

const EMPTY_OBJ = Object.freeze({});

interface MessageConstructor {
  (
    name: string,
    namespace?: string,
    flags?: { withinQuery?: boolean }
  ): void;
  parse(msg: MessageForm): Message;
}

export abstract class BaseMessage implements Message {
  #name: string;
  #namespace?: string;
  #withinQuery: boolean;

  static parse(msg: MessageForm): Message {
    throw new Error("Not implemented");
  }

  constructor(
    name: string,
    namespace?: string,
    flags: MessageFlags = EMPTY_OBJ
  ) {
    this.#name = name;
    this.#namespace = namespace;
    this.#withinQuery = flags?.withinQuery ?? false;
  }

  abstract get args(): MessageArgs;
  abstract get arity(): number;

  get name() {
    return this.#name;
  }

  get namespace() {
    return this.#namespace;
  }

  get ident(): string {
    return `${this.name}_${this.arity}`;
  }

  get interned(): string {
    return escapeChars(this.ident);
  }

  isWithinQuery(): boolean {
    return this.#withinQuery;
  }

  withinQuery(): Message {
    if (this.#withinQuery) {
      return this;
    }

    return new (this.constructor as MessageConstructor)(
      this.name,
      this.namespace,
      {
        withinQuery: true,
      }
    );
  }

  toKeyword() {
    return Keyword.intern(this.name, this.namespace);
  }

  toSymbol() {
    return Symbol.intern(this.name, this.namespace);
  }

  toString() {
    if (this.args.length === 0) {
      return prStr(this.toKeyword());
    }

    return prStr(
      new Vector(this.toKeyword(), ...this.args)
    );
  }

  bind(obj: Obj): BoundMessage {
    return new BoundMessage(this, obj);
  }

  abstract toJS(ctx: Context, obj: Form): string;
  abstract sendTo(obj: Obj): unknown;
}
