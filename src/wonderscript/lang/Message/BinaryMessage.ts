import { BaseMessage } from "./BaseMessage";
import { MessageArgs, MessageFlags, Obj } from "../Message";
import { Form } from "../../compiler/core";

export abstract class BinaryMessage extends BaseMessage {
  #other: Form;

  constructor(name: string, namespace: string, other: Form, flags: MessageFlags = {}) {
    super(name, namespace, flags);
    this.#other = other;
  }
  
  get arity(): number {
    return 1;
  }

  get args(): MessageArgs {
    return [this.#other];
  }
}