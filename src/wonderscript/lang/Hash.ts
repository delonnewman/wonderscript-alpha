export class Hash extends Map {
  get interned() {
    const keys = Array.from(this.keys()).join('_');
    return `Hash_${keys}`;
  }
}