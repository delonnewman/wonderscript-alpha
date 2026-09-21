import { prStr } from "../compiler";
import { Keyword, Vector, Named, Nil, Symbol, namedHash } from "../lang";
import { Form } from "../compiler/core";
import { Context } from "./Context";
import { QueryMessage } from "./Message/QueryMessage";
import { BaseMessage } from "./Message/BaseMessage";
import { BoundMessage } from "./Message/BoundMessage";
import {
  JSEquivMessage,
  JSIdenticalMessage,
  JSInstanceOfMessage,
  JSNewMessage,
  JSTypeMessage,
  JSPropMessage,
  JSMethodMessage,
  JSSetPropMessage
} from "./javascript";
import { UnaryMessage } from "./Message/UnaryMessage";
import { ArgListMessage } from "./Message/ArgListMessage";

export type SimpleMessageForm = string | Keyword | Symbol;
export type CompoundMessageForm = [Keyword | Symbol, ...unknown[]] | Vector<unknown>;
export type MessageForm = SimpleMessageForm | CompoundMessageForm;

export const EMPTY_ARRAY = Object.freeze([]);
export const EMPTY_OBJ = Object.freeze({});

export type Obj = {
  [key: string]: unknown;
};

export type MessageArgs = unknown[] | readonly unknown[] | Vector;
export type MessageFlags = Partial<{ withinQuery: boolean }>;

export interface Envelope {
  sendTo(obj: unknown): unknown;
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
  ["js/type", JSTypeMessage],
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

    if (msg instanceof Keyword || msg instanceof Symbol || typeof msg === "string") {
      return this.simple(msg);
    }

    throw new Error(
      `message form expected vector or array, got ${prStr(msg)} instead`
    );
  },

  compound(msg: CompoundMessageForm): Message {
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

    return new ArgListMessage(name, ns, msg.slice(1));
  },

  simple(msg: SimpleMessageForm): Message {
    if (msg instanceof Keyword || msg instanceof Symbol) {
      const name = msg.name;
      const ns = msg.namespace;

      const m = PRIMITIVE_MESSAGES.get(namedHash(name, ns));
      if (m !== undefined &&
        typeof (m as { parse: (msg: MessageForm) => Message }).parse === "function"
      ) {
        return (m as { parse: (msg: MessageForm) => Message }).parse(msg);
      }

      if (ns === "js.prop") {
        return new JSPropMessage("prop", "js", [msg.name]);
      }

      if (ns === "js") {
        return new JSMethodMessage(msg.name, ns);
      }

      return new UnaryMessage(msg.name, msg.namespace);
    }

    if (typeof msg === "string") {
      return new UnaryMessage(msg);
    }

    throw new Error(
      `message form expected keyword or string, got ${prStr(msg)} instead`
    );
  },
};

// @ts-ignore
Message.send_2 = Message.send;

// @ts-ignore
Message._DASH__GT_js_2 = Message.toJS;

// @ts-ignore
Message.build_1 = Message.build;
