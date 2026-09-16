import { prStr } from "../compiler";
import { Keyword, Vector, Symbol } from "../lang";
import { escapeChars } from "../compiler/utils";

export type Message =
  | string
  | Keyword
  | Symbol
  | [Symbol | Keyword, ...unknown[]]
  | Vector<unknown>;

const EMPTY_ARRAY = Object.freeze([]);
export const JS_DIG_KW = Keyword.intern("dig", "js");
export const RESPOND_TO_KW = Keyword.intern("respond-to?");

export const Message = {
  intern(msg: Message): string {
    if (typeof msg === "string") return escapeChars(msg);
    if (msg instanceof Keyword || msg instanceof Symbol) {
      return escapeChars(msg.name());
    }

    if (Array.isArray(msg) || msg instanceof Vector) {
      let name = msg[0];
      if (name instanceof Keyword || name instanceof Symbol) {
        const ns = name.namespace();

        name = escapeChars(name.name());
        if (ns === "js") return name;
      }

      return `${name}_${msg.slice(1).length}`;
    }

    throw new Error(`unknown message type ${prStr(msg)}`);
  },

  args(msg: Message) {
    if (Array.isArray(msg) || msg instanceof Vector) {
      return msg.slice(1);
    }

    if ((msg instanceof Keyword || msg instanceof Symbol) && msg.namespace() === "js.prop") {
      return;
    }

    return EMPTY_ARRAY;
  },

  send(obj: Record<string, unknown>, msg: Message) {
    if ((msg instanceof Vector || msg instanceof Array) && RESPOND_TO_KW.equals(msg[0])) {
      return Message.intern(msg[1]) in obj;
    }

    const name = this.intern(msg);
    const args = this.args(msg);

    const fn = obj[name];
    if (typeof fn === "function") {
      return fn.apply(obj, args);
    }

    throw new Error(`unknown message ${prStr(msg)}`);
  },
};
