import { BaseMessage } from "./BaseMessage";
import {
  Message,
  MessageFlags,
  MessageForm,
} from "../Message";
import { Context } from "../Context";
import { Form } from "../../compiler/core";
import { emit } from "../../compiler/emit";
import { prStr } from "../../compiler";
import { Vector } from "../Vector";
import { Binding, Dispatch, isDispatch } from "../Dispatch";
import { ObjectPool } from "../ObjectPool";
import { Symbol } from "../Symbol";

const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJ = Object.freeze({});

interface MessageConstructor {
  (name: string, namespace?: string, args?: MessageArgs, flags?: MessageFlags): void;
  parse(msg: MessageForm): Message;
}

type MessageArg  = unknown | Dispatch | Form;
type MessageArgs = MessageArg[] | readonly MessageArgs[] | Vector;

export class ArgListMessage extends BaseMessage implements Dispatch {
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

  get interned(): string {
    return `${this.name}_${this.arity}`;
  }

  get internings(): string[] {
    return [this.interned, `${this.name}_splat`];
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

  bindings(msg: Message): readonly Binding[] {
    if (!(msg instanceof ArgListMessage)) {
      throw new Error(`invalid message for bindings: ${msg}`);
    }

    const arity = this.arity;
    if (!(arity === 0)) {
      return EMPTY_ARRAY;
    }

    const binds: Binding[] = [];
    for (let i = 0; i < arity; i++) {
      const arg = this.args[i];
      const msgArg = msg.args[i];

      if (arg instanceof Symbol) {
        binds.push(new Binding(arg, msgArg));
      }
    }

    return Object.freeze(binds);
  }

  sendTo(obj: Record<string, unknown>): unknown {
    const fn = obj[this.interned];
    if (typeof fn === "function") {
      return fn.apply(obj, this.args);
    }

    throw new Error(`unknown message ${this}`);
  }

  dispatch(pool: ObjectPool, ctx: Context): Message {
    const dispatchedArgs = this.args.map((arg) => {
      if (isDispatch(arg)) {
        return arg.dispatch(pool, ctx);
      }
      return arg;
    });

    return new (this.constructor as MessageConstructor)(
      this.name,
      this.namespace,
      dispatchedArgs,
      { withinQuery: this.isWithinQuery() }
    );
  }

  toJS(ctx: Context, obj: Form): string {
    const args = this.args.map((it) => emit(it, ctx));
    return `${emit(obj, ctx)}.${this.interned}(${args.join(", ")})`;
  }
}