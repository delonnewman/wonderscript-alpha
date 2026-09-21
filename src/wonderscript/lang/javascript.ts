import { UnaryMessage } from "./Message/UnaryMessage";
import { Context } from "./Context";
import { Form } from "../compiler/core";
import { emit } from "../compiler/emit";
import { BinaryMessage } from "./Message/BinaryMessage";
import { MessageForm } from "./Message";
import { Vector } from "./Vector";
import { prStr } from "../compiler";
import { BaseMessage } from "./Message/BaseMessage";

export type PrimitiveMessage = typeof JSTypeMessage

export class JSTypeMessage extends UnaryMessage {
  static parse(msg: MessageForm) {
    if (msg instanceof Array || msg instanceof Vector) {
      return new JSTypeMessage('typeof', 'js', msg.slice(1));
    }

    throw new Error(`invalid message: ${prStr(msg)}`);
  }

  sendTo(obj: Record<string, unknown>): unknown {
    return typeof obj;
  }

  toJS(ctx: Context, obj: Form): string {
    return `typeof ${emit(obj, ctx)}`;
  }
}

interface Constructor {
  (...args: unknown[]): void;
}

export class JSNewMessage extends BaseMessage {
  static parse(msg: MessageForm) {
    if (msg instanceof Array || msg instanceof Vector) {
      return new JSTypeMessage("new", "js", msg.slice(1));
    }

    throw new Error(`invalid message: ${prStr(msg)}`);
  }

  sendTo(obj: Constructor): unknown {
    return new obj(...this.args);
  }

  toJS(ctx: Context, obj: Form): string {
    return `typeof ${emit(obj, ctx)}`;
  }
}

export class JSEquivMessage extends BinaryMessage {
  static parse(msg: MessageForm) {
    if (msg instanceof Array || msg instanceof Vector) {
      return new JSTypeMessage("equiv?", "js", msg.slice(1));
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
      return new JSTypeMessage("identical?", "js", msg.slice(1));
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
      return new JSTypeMessage("instance?", "js", msg.slice(1));
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
