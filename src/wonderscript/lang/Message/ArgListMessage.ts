import { BaseMessage } from "./BaseMessage";
import {
  Message,
  MessageArgs,
  MessageFlags, MessageForm,
  Obj,
} from "../Message";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emit } from "../../compiler/emit";
import { BoundMessage } from "./BoundMessage";
import { prStr } from "../../compiler";
import { Vector } from "../Vector";

const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJ = Object.freeze({});

interface MessageConstructor {
  (name: string, namespace?: string, args?: MessageArgs, flags?: MessageFlags): void;
  parse(msg: MessageForm): Message;
}

export class ArgListMessage extends BaseMessage {
  #args: MessageArgs;

  constructor(
    name: string,
    namespace?: string,
    args: MessageArgs = EMPTY_ARRAY,
    flags: MessageFlags = EMPTY_OBJ
  ) {
    super(name, namespace, flags);
    this.#args = Array.from(args);
    Object.freeze(this);
  }

  get arity(): number {
    return this.#args.length;
  }

  get args() {
    return this.#args;
  }

  withinQuery(): ArgListMessage {
    if (this.isWithinQuery()) {
      return this;
    }

    return new (this.constructor as MessageConstructor)(
      this.name,
      this.namespace,
      this.args,
      {
        withinQuery: true,
      }
    );
  }

  toString() {
    if (this.args.length === 0) {
      return prStr(this.toKeyword());
    }

    return prStr(new Vector(this.toKeyword(), ...this.args));
  }

  sendTo(obj: unknown): unknown {
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