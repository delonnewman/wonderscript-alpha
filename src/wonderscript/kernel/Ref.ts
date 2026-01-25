type Validator = (val: unknown) => boolean;
type Subscriber = Function;

export class Ref {
  #value?: unknown;
  #validator?: Validator
  #subscribers: Subscriber[];

  constructor(value?: unknown, validator?: Validator) {
    this.#value = value;
    this.#validator = validator;
    this.#subscribers = [];
  }

  deref() {
    return this.#value;
  }

  subscribe(subscriber: Subscriber) {
    this.#subscribers.push(subscriber);
    return this;
  }

  set(val: unknown) {
    if (this.#validator && !this.#validator(val)) {
      throw new Error(`${val} is not a valid value`);
    }
    
    for (const subscriber of this.#subscribers) {
      subscriber.call(this, this.#value, val);
    }

    this.#value = val;
    return this;
  }
}
