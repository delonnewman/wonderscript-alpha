export class ObjectSpace {
  #oav: Record<string, unknown>;
  #aov: Record<string, unknown>;

  constructor() {
    this.#oav = {};
    this.#aov = {};
  }
}