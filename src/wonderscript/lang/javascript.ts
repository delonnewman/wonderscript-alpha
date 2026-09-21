import { Context } from "./Context";
import { Form } from "../compiler/core";
import { emit } from "../compiler/emit";
import { BinaryMessage } from "./Message/BinaryMessage";
import { MessageForm } from "./Message";
import { Vector } from "./Vector";
import { prStr } from "../compiler";
import { BaseMessage } from "./Message/BaseMessage";
import { JSTypeMessage } from "./javascript/JSTypeMessage";
import { Keyword } from "./Keyword";
import { Symbol } from "./Symbol";
import { emitClassInit } from "../compiler/emit/emitClassInit";
import { map } from "./runtime";

export * from "./javascript/JSTypeMessage"

interface Constructor {
  (...args: unknown[]): void;
}

export class JSNewMessage extends BaseMessage {
  static SIMPLE = new JSNewMessage('new', 'js');

  static parse(msg: MessageForm) {
    if (msg instanceof Array || msg instanceof Vector) {
      return new this("new", "js", msg.slice(1));
    } else if (msg instanceof Symbol || msg instanceof Keyword || typeof msg === "string") {
      return this.SIMPLE;
    }

    throw new Error(`invalid message: ${prStr(msg)}`);
  }

  sendTo(obj: Constructor): unknown {
    return new obj(...this.args);
  }

  toJS(ctx: Context, obj: Form): string {
    const args = this.args.map((arg) => emit(arg, ctx));
    return `new ${emit(obj, ctx)}(${args.join(", ")})`;
  }
}

export class JSEquivMessage extends BinaryMessage {
  static parse(msg: MessageForm) {
    if (msg instanceof Array || msg instanceof Vector) {
      return new this("equiv?", "js", msg.slice(1));
    }

    throw new Error(`invalid message: ${prStr(msg)}`);
  }

  sendTo(obj: Record<string, unknown>): unknown {
    return obj == this.args[0];
  }

  toJS(ctx: Context, obj: Form): string {
    return `(${emit(obj, ctx)}==${emit(this.args[0], ctx)})`;
  }
}

export class JSIdenticalMessage extends BinaryMessage {
  static parse(msg: MessageForm) {
    if (msg instanceof Array || msg instanceof Vector) {
      return new this("identical?", "js", msg.slice(1));
    }

    throw new Error(`invalid message: ${prStr(msg)}`);
  }

  sendTo(obj: Record<string, unknown>): unknown {
    return obj === this.args[0];
  }

  toJS(ctx: Context, obj: Form): string {
    return `(${emit(obj, ctx)}===${emit(this.args[0], ctx)})`;
  }
}

export class JSInstanceOfMessage extends BinaryMessage {
  static parse(msg: MessageForm) {
    if (msg instanceof Array || msg instanceof Vector) {
      return new this("instance?", "js", msg.slice(1));
    }

    throw new Error(`invalid message: ${prStr(msg)}`);
  }

  sendTo(obj: Record<string, unknown>): unknown {
    return obj instanceof this.args[0];
  }

  toJS(ctx: Context, obj: Form): string {
    return `(${emit(obj, ctx)} instanceof ${emit(this.args[0], ctx)})`;
  }
}
