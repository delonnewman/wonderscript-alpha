import { Class } from "./Class";
import { stringHash } from "./utils";

export type ObjectValue = boolean | null | undefined | string | number;

/**
 * Object value layout
 *
 * "wso$45$2"
 *    |  |  |
 *    |  |  +--- type
 *    |  +---- id
 *    +---- tag
 */

export enum ObjectType {
  VALUE = 1 << 0,
  REF = 1 << 1,
}

const TAG = "wso$";

export class ObjectPool {
  #pool: Class[];

  constructor(NilClass: Class, TrueClass: Class, FalseClass: Class, Float: Class, String: Class) {
    this.#pool = [NilClass, TrueClass, FalseClass, Float, String];
  }

  /**
   * Allocate a new object and return it.
   *
   * @param klass
   * @param type
   */
  allocate(klass: Class, type = ObjectType.REF) {
    this.#pool.push(klass);
    return `${TAG}$${this.#pool.length - 1}$${type}`;
  }

  /**
   * Return the id of the object.
   *
   * @param object
   */
  id(object: ObjectValue): number {
    if (object === null || object === undefined) {
      return 0;
    }

    if (object === true) {
      return 1;
    }

    if (object === false) {
      return 2;
    }

    if (typeof object === 'number') {
      return object;
    }

    if (typeof object === 'string' && !object.startsWith(TAG)) {
      return stringHash(object);
    }

    const [_tag, id, _type] = object.split("$");
    return Number(id);
  }

  /**
   * Return true if the value is a valid object, otherwise return false.
   *
   * @param object
   */
  isObject(object: unknown): object is `wso$${number}$${number}` {
    if (object === null || object === undefined) return true;

    if (typeof object === 'boolean' || typeof object === 'number') return true;
    if (typeof object === "string" && object.startsWith(TAG)) {
      return true;
    }

    return false;
  }

  /**
   * Return the type of the object.
   *
   * @param object
   */
  objectType(object: ObjectValue): ObjectType {
    if (typeof object !== 'string' || !object.startsWith(TAG)) {
      return ObjectType.VALUE;
    }

    const [_tag, _id, type] = object.split("$");
    return Number(type);
  }

  /**
   * Return the class of the object.
   *
   * @param object
   */
  class(object: ObjectValue) {
    if (typeof object === 'number') {
      return this.#pool[3];
    }

    if (typeof object === 'string') {
      return this.#pool[4];
    }

    const id = this.id(object);
    const klass = this.#pool[id];
    if (klass === undefined) {
      throw new Error(`No class found for object ${object}`);
    }
    return klass;
  }
}