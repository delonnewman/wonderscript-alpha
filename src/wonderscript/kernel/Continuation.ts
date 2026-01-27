import { Transmission } from "./Transmission";

export class Continuation {
  transmission: Transmission;
  next?: Continuation;
  prev?: Continuation;

  constructor(
    transmission?: Transmission,
    next?: Continuation,
    prev?: Continuation
  ) {
    this.transmission = transmission;
    this.next ??= next;
    this.prev ??= prev;
  }

  append(transmission: Transmission) {
    if (this.transmission) {
      return new Continuation(transmission, this.next, this);
    } else {
      return new Continuation(transmission, this.next);
    }
  }

  toArray() {
    const array = [];
    let cont: Continuation | undefined = this;
    while (cont) {
      array.push(cont);
      cont = cont.next;
    }
    return array;
  }
}
