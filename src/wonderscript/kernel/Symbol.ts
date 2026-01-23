export class Symbol {
  readonly name: string
  readonly namespace?: string

  static intern (name: string, namespace?: string) {
    new this(name, namespace);
  }

  constructor(name: string, namespace?: string) {
    this.name = name;
    this.namespace = namespace;
  }

  toString() {
    if (!this.namespace) {
      return this.name;
    }
    return `${this.namespace}$${this.name}`;
  }
}
