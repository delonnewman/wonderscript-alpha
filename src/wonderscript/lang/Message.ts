import { prStr } from "../compiler";
import { Keyword, Vector } from "../lang";
import { Form } from "../compiler/core";
import { Context } from "./Context";
import { QueryMessage } from "./Message/QueryMessage";
import { JSPropMessage } from "./Message/JSPropMessage";
import { JSSetPropMessage } from "./Message/JSSetPropMessage";
import { JSMethodMessage } from "./Message/JSMethodMessage";
import { BaseMessage } from "./Message/BaseMessage";
import { BoundMessage } from "./Message/BoundMessage";

export type MessageForm =
  string | Keyword | [Keyword, ...unknown[]] | Vector<unknown>;

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

export interface Message extends Envelope, CompilableMessage {
  readonly name: string;
  readonly namespace?: string;
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

export const JS_DIG_KW = Keyword.intern("prop", "js");
export const RESPOND_TO_KW = Keyword.intern("respond-to?");
export const JS_PROP_SET = Keyword.intern("set!", "js");

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

  compound(msg: unknown[] | Vector): Message {
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
      return new QueryMessage(name, ns, msg.slice(1));
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

    return new BaseMessage(name, ns, msg.slice(1));
  },

  simple(msg: Keyword | string): Message {
    if (msg instanceof Keyword) {
      if (msg.namespace() === "js.prop") {
        return new JSPropMessage("prop", "js", [msg.name()]);
      }

      if (msg.namespace() === "js") {
        return new JSMethodMessage(msg.name(), msg.namespace());
      }

      return new BaseMessage(msg.name(), msg.namespace());
    }

    if (typeof msg === "string") {
      return new BaseMessage(msg);
    }

    throw new Error(
      `message form expected keyword or string, got ${prStr(msg)} instead`
    );
  },
};
