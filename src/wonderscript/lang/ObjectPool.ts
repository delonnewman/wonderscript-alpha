import { Class } from "./Class";
import { stringHash } from "./utils";
import { Keyword } from "./Keyword";
import { Symbol } from "./Symbol";

export type ObjectValue = boolean | null | undefined | string | number | Keyword | Symbol;

/**
 * Object value layout
 *
 * "wso$45$2"
 *   |  |  |
 *   |  |  +--- type
 *   |  +---- id
 *   +---- tag
 */

export enum ObjectType {
  VALUE = 1 << 0,
  REF = 1 << 1,
}

const TAG = "wso$";

export type Foundation = {
  NilClass: Class,
  TrueClass: Class,
  FalseClass: Class,
  Float: Class,
  String: Class,
  Class: Class,
  Keyword: Class,
  Symbol: Class,
}

export class ObjectPool {
  #pool: Class[];
  #foundation = {
    NilClass: 0,
    FalseClass: 1,
    TrueClass: 2,
    Float: 3,
    String: 4,
    Symbol: 5,
    Class: 6,
    Keyword: 7,
  };

  constructor(foundation: Foundation) {
    const pool = [];
    for (const [klass, id] of Object.entries(this.#foundation)) {
      const obj = foundation[klass as keyof Foundation];
      if (obj === undefined) throw new Error(`Foundation class ${klass} is not provided`);
      pool[id] = obj;
    }
    this.#pool = pool;
  }

  foundationClassId(klass: keyof Foundation) {
    return this.#foundation[klass];
  }

  foundationClassObject(klass: keyof Foundation) {
    const id = this.foundationClassId(klass);
    return this.#pool[id];
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
      return this.foundationClassId('NilClass');
    }

    if (object === true) {
      return this.foundationClassId('TrueClass');
    }

    if (object === false) {
      return this.foundationClassId('FalseClass');
    }

    if (typeof object === "number") {
      return object;
    }

    if (typeof object === "string" && !object.startsWith(TAG)) {
      return stringHash(object);
    }

    if (object instanceof Keyword || object instanceof Symbol) {
      return object.hashCode();
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

    if (typeof object === "boolean" || typeof object === "number") return true;
    if (typeof object === "string" && object.startsWith(TAG)) {
      return true;
    }

    return object instanceof Keyword || object instanceof Symbol;
  }

  /**
   * Return the type of the object.
   *
   * @param object
   */
  objectType(object: ObjectValue): ObjectType {
    if (typeof object !== "string" || !object.startsWith(TAG)) {
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
    if (typeof object === "number") {
      return this.foundationClassObject('Float');
    }

    if (typeof object === "string") {
      return this.foundationClassObject('String');
    }

    const id = this.id(object);
    const klass = this.#pool[id];
    if (klass === undefined) {
      throw new Error(`No class found for object ${object}`);
    }
    return klass;
  }
}