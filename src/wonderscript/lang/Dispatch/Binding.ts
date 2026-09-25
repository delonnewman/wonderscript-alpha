import { Action } from "./Action";
import { Symbol } from "../Symbol";

export class Binding {
  #name: Symbol;
  #action: Action;

  constructor(name: Symbol, action: Action) {
    this.#name = name;
    this.#action = action;
  }

  get action() {
    return this.#action;
  }

  get name() {
    return this.#name;
  }
}

