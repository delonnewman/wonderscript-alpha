import {
  CompilableMessage,
  Envelope,
  Message,
  MessageFlags,
  MessageForm,
} from "../Message";
import { escapeChars } from "../../compiler/utils";
import { Keyword } from "../Keyword";
import { Symbol } from "../Symbol";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { Binding } from "../Dispatch/Binding";

const EMPTY_OBJ = Object.freeze({});

interface MessageConstructor {
  (
    name: string,
    namespace?: string,
    flags?: { withinQuery?: boolean }
  ): void;
  parse(msg: MessageForm): Message;
}

export abstract class BaseMessage implements Message, Envelope, CompilableMessage {
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

  abstract get args(): unknown;
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

  get internings(): string[] {
    return [this.interned];
  }

  isWithinQuery(): boolean {
    return this.#withinQuery;
  }

  withinQuery(): BaseMessage {
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

  abstract bindings(msg: Message): readonly Binding[];
  abstract toJS(ctx: Context, obj: Form): string;
  abstract sendTo(obj: unknown): unknown;
}
