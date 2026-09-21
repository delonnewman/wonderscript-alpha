import {
  isMessageForm,
  Message,
  MessageForm,
  Obj,
  RESPOND_TO_KW,
} from "../Message";
import { Form } from "../../compiler/core";
import { prStr } from "../../compiler";
import { Context } from "../Context";
import { emit } from "../../compiler/emit";
import { BaseMessage } from "./BaseMessage";
import { emitKeyword } from "../../compiler/emit/emitKeyword";
import { Vector } from "../Vector";

export class QueryMessage extends BaseMessage {
  static parse(msg: MessageForm) {
    if (msg instanceof Array || msg instanceof Vector) {
      return new QueryMessage('respond-to?', undefined, msg.slice(1));
    }

    throw new Error(`invalid message form: ${prStr(msg)}`);
  }

  get query(): Message | Form {
    if (isMessageForm(this.args[0])) {
      return Message.build(this.args[0]).withinQuery();
    }

    return this.args[0];
  }

  sendTo(obj: Obj): boolean {
    const query = this.query;
    if (query instanceof BaseMessage) {
      if (query.args.length > 0) {
        obj = query.sendTo(obj) as Obj;
      }

      return query.interned in obj;
    }

    throw new Error(`invalid method query: ${prStr(query)}`);
  }

  toJS(ctx: Context, obj: Form): string {
    const query = this.query;
    if (query instanceof BaseMessage) {
      const code = query.args.length ? query.toJS(ctx, obj) : emit(obj, ctx);
      return `("${query.interned}" in ${code})`;
    }

    return `wonderscript.lang.Message.send(${emit(obj, ctx)}, [${emitKeyword(RESPOND_TO_KW)}, ${emit(query as Form, ctx)}])`;
  }
}
