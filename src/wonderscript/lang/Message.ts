import { prStr } from "../compiler";
import { Keyword, Vector, Named, Nil, Symbol, namedHash } from "../lang";
import { Form } from "../compiler/core";
import { Context } from "./Context";
import { QueryMessage } from "./Message/QueryMessage";
import { JSPropMessage } from "./javascript/JSPropMessage";
import { JSSetPropMessage } from "./javascript/JSSetPropMessage";
import { JSMethodMessage } from "./javascript/JSMethodMessage";
import { BaseMessage } from "./Message/BaseMessage";
import { BoundMessage } from "./Message/BoundMessage";
import {
  JSEquivMessage,
  JSIdenticalMessage,
  JSInstanceOfMessage,
  JSNewMessage,
  JSTypeMessage,
} from "./javascript";
import { pt } from "../util";

export type MessageForm =
  string | Keyword | Symbol | [Keyword | Symbol, ...unknown[]] | Vector<unknown>;

export type Obj = {
  [key: string]: unknown;
};

export type MessageArgs = unknown[] | readonly unknown[] | Vector;

export interface Envelope {
  sendTo(obj: Obj): unknown;
}

export interface CompilableMessage {
  toJS(ctx: Context, obj: Form): string;
}

export interface Message extends Named, Envelope, CompilableMessage {
  readonly name: string;
  readonly namespace: string | Nil;
  readonly args: MessageArgs;
  readonly interned: string;
  readonly arity: number;

  withinQuery(): Message;
  isWithinQuery(): boolean;
  hasSplatArgs(): boolean;
  bind(obj: Obj): BoundMessage;
}

export function isMessageForm(form: unknown): form is MessageForm {
  return (
    typeof form === "string" ||
    form instanceof Keyword ||
    Array.isArray(form) ||
    form instanceof Vector
  );
}

export const RESPOND_TO_KW = Keyword.intern("respond-to?");

export type ParsableMessage = {
  parse(msg: MessageForm): Message
}

const PRIMITIVE_MESSAGES = new Map<string, unknown>([
  ["js/typeof", JSTypeMessage],
  ["js/equiv?", JSEquivMessage],
  ["js/identical?", JSIdenticalMessage],
  ["js/instance?", JSInstanceOfMessage],
  ["js/set!", JSSetPropMessage],
  ["js/prop", JSPropMessage],
  ["js/new", JSNewMessage],
  ["respond-to?", QueryMessage],
]);

export const Message = {
  send(obj: Record<string, unknown>, msg: MessageForm): unknown {
    return this.build(msg).sendTo(obj);
  },

  toJS(ctx: Context, msg: MessageForm, obj: Form): string {
    return this.build(msg).toJS(ctx, obj);
  },

  build(msg: MessageForm): Message {
    if (msg instanceof Vector || Array.isArray(msg)) {
      return this.compound(msg);
    }

    if (msg instanceof Keyword || typeof msg === "string") {
      return this.simple(msg);
    }

    throw new Error(
      `message form expected vector or array, got ${prStr(msg)} instead`
    );
  },

  compound(msg: [Keyword | Symbol, ...unknown[]] | Vector): Message {
    if (msg.length === 0) {
      throw new Error(`invalid arguments expected at least 1, got 0 instead`);
    }

    let name: string, ns: string | undefined;
    const tag = msg[0];
    if (tag instanceof Keyword || tag instanceof Symbol) {
      name = tag.name
      ns = tag.namespace
    } else if (typeof tag === "string") {
      name = tag
    } else {
      throw new Error(
        `invalid tag expected keyword or string, got ${prStr(tag)} instead`
      );
    }

    const m = PRIMITIVE_MESSAGES.get(namedHash(name, ns));
    if (m !== undefined &&
      typeof (m as { parse: (msg: MessageForm) => Message }).parse === "function"
    ) {
      return (m as { parse: (msg: MessageForm) => Message }).parse(msg);
    }

    if (ns == 'js') {
      return new JSMethodMessage(name, ns, msg.slice(1));
    }

    return new BaseMessage(name, ns, msg.slice(1));
  },

  simple(msg: Keyword | Symbol | string): Message {
    if (msg instanceof Keyword || msg instanceof Symbol) {
      if (msg.namespace === "js.prop") {
        return new JSPropMessage("prop", "js", [msg.name]);
      }

      if (msg.namespace === "js") {
        return new JSMethodMessage(msg.name, msg.namespace);
      }

      return new BaseMessage(msg.name, msg.namespace);
    }

    if (typeof msg === "string") {
      return new BaseMessage(msg);
    }

    throw new Error(
      `message form expected keyword or string, got ${prStr(msg)} instead`
    );
  },
};
