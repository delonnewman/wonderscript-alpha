import { Script } from "./Script";
import { ObjectPool } from "../ObjectPool";
import { Context } from "../Context";
import { Binding, Dispatch } from "../Dispatch";
import { MetaData } from "../Meta";

export class Block {
  script: Script;

  static fromActions(actions: Dispatch[], binds: Binding[] = [], meta?: MetaData) {
    return new this(new Script(actions, binds, meta));
  }

  get bindings() {
    return this.script.bindings;
  }

  get actions() {
    return this.script.actions;
  }

  constructor(script: Script) {
    this.script = script;
  }

  dispatch(_pool: ObjectPool, _ctx: Context) {
    return this.script;
  }
}