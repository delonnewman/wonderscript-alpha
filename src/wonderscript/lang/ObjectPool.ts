import { Class } from "./Class";
import { stringHash } from "./utils";
import { Keyword } from "./Keyword";
import { Symbol } from "./Symbol";
import { Hash } from "./Hash";
import { Vector } from "./Vector";
import { Set } from "./Set";
import { Array } from "./Array";
import { isHashable } from "./Value";
import { Message } from "./Message";

export type ObjectRef = `wso$${number}$${number}`;

export type ObjectValue =
    boolean
  | null
  | undefined
  | string
  | number
  | Keyword
  | Symbol
  | Array
  | Hash
  | Set
  | Vector
  | ObjectRef;

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
  Class: Class;
  NilClass: Class;
  FalseClass: Class;
  TrueClass: Class;
  Float: Class;
  String: Class;
  Symbol: Class;
  Keyword: Class;
  Array: Class;
  Hash: Class;
  Set: Class;
  Vector: Class;
}

const FOUNDATION_MAP = {
  Class: "Class",
  NilClass: "Class",
  nil: "NilClass",
  FalseClass: "Class",
  false: "FalseClass",
  TrueClass: "Class",
  true: "TrueClass",
  Float: "Class",
  FloatInstances: "Float",
  String: "Class",
  StringInstances: "String",
  Symbol: "Class",
  SymbolInstances: "Symbol",
  Keyword: "Class",
  KeywordInstances: "Keyword",
  Array: "Class",
  ArrayInstances: "Array",
  Hash: "Class",
  HashInstances: "Hash",
  Set: "Class",
  SetInstances: "Set",
  Vector: "Class",
  VectorInstances: "Vector",
};

type FoundationMap = typeof FOUNDATION_MAP;
type FoundationObjectName = keyof FoundationMap;
type FoundationClassName = keyof Foundation;

export class ObjectPool {
  #pool: Class[];
  #foundation = new Map<FoundationObjectName, number>();

  constructor(foundation: Foundation) {
    const pool = [];
    let id = 0;
    for (const [obj, klass] of Object.entries(FOUNDATION_MAP) as [
      FoundationObjectName,
      FoundationClassName,
    ][]) {
      const klassObj = foundation[klass];
      if (klassObj === undefined)
        throw new Error(`Foundation class ${klass} is not provided`);
      this.#foundation.set(obj, id);
      pool[id] = klassObj;
      id++;
    }

    this.#pool = pool;
  }

  get pool() {
    return this.#pool;
  }

  foundationObjectId(object: FoundationObjectName) {
    return this.#foundation.get(object);
  }

  foundationClassObject(object: FoundationObjectName) {
    const id = this.foundationObjectId(object);
    return this.#pool[id];
  }

  send(obj: ObjectValue, msg: Message) {
    // TODO: will probably want to cache this for the interpreter and inline the method for the compilers
    const method = this.class(obj).findMethod(msg);
    return method(obj, msg);
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
      return this.foundationObjectId("nil");
    }

    if (object === true) {
      return this.foundationObjectId("true");
    }

    if (object === false) {
      return this.foundationObjectId("false");
    }

    if (typeof object === "number") {
      return object;
    }

    if (typeof object === "string" && !object.startsWith(TAG)) {
      return stringHash(object);
    }

    if (isHashable(object) || object instanceof Vector) {
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
  isObject(object: unknown): object is ObjectValue {
    if (object === null || object === undefined) return true;

    if (typeof object === "boolean" || typeof object === "number") return true;
    if (typeof object === "string" && object.startsWith(TAG)) {
      return true;
    }

    return object instanceof Keyword ||
      object instanceof Symbol ||
      object instanceof Array ||
      object instanceof Hash ||
      object instanceof Set ||
      object instanceof Vector;
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
      return this.foundationClassObject("FloatInstances");
    }

    if (typeof object === "string") {
      return this.foundationClassObject("StringInstances");
    }

    if (object instanceof Keyword) {
      return this.foundationClassObject("KeywordInstances");
    }

    if (object instanceof Symbol) {
      return this.foundationClassObject("SymbolInstances");
    }

    if (object instanceof Array) {
      return this.foundationClassObject("ArrayInstances");
    }

    if (object instanceof Hash) {
      return this.foundationClassObject("HashInstances");
    }

    if (object instanceof Set) {
      return this.foundationClassObject("SetInstances");
    }

    if (object instanceof Vector) {
      return this.foundationClassObject("VectorInstances");
    }

    const id = this.id(object);
    const klass = this.#pool[id];
    if (klass === undefined) {
      throw new Error(`No class found for object ${object}`);
    }

    return klass;
  }
}