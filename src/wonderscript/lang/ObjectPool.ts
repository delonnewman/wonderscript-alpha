import { Class } from "./Class";
import { stringHash } from "./utils";
import { Message } from "./Message";
import { Method } from "./Method";

export type ObjectRef = `wso$${number}$${number}`;

export type ObjectValue =
    boolean
  | null
  | undefined
  | string
  | number
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
  null: Class;
  undefined: Class;
  true: Class;
  false: Class;
  number: Class;
  string: Class;
  // TODO: add back
  // function: Class; // js/Function
  // object: Class; // js/Object
  // symbol: Class; // js/Symbol
  // Class: Class;
  Numeric: Class;
  String: Class;
  FalseClass: Class;
  TrueClass: Class;
  NilClass: Class;
}

const NIL_ID = 0;
const TRUE_ID = 1;
const FALSE_ID = 2;
let CURRENT_ID = 3;

export class ObjectPool {
  static METHOD_CACHE: Record<string, Method> = Object.create(null);

  #pool: Record<string | number, Class>;

  constructor(foundation: Foundation) {
    const pool = Object.create(null);
    const entries = Object.entries(foundation) as [keyof Foundation, Class][];
    for (const [obj, klass] of entries) {
      pool[obj] = klass;
    }

    this.#pool = pool;
  }

  get pool() {
    return this.#pool;
  }

  select(obj: ObjectValue, msg: Message) {
    const klass = this.class(obj);
    const cacheKey = `${klass.interned}$${msg.interned}`;

    const cachedMethod = ObjectPool.METHOD_CACHE[cacheKey];
    if (cachedMethod !== undefined) {
      return cachedMethod;
    }

    const method = klass.findMethod(msg);
    ObjectPool.METHOD_CACHE[cacheKey] = method;

    return method;
  }

  newID() {
    return CURRENT_ID++;
  }

  newObjectRef(type: ObjectType) {
    const id = this.newID();
    return `${TAG}$${id}$${type}`;
  }

  associateClass(obj: ObjectValue, klass: Class) {
    if (typeof obj === 'string' && obj.startsWith(TAG)) {
      obj = this.id(obj);
    }

    this.#pool[`${obj}`] = klass;
  }

  /**
   * Allocate a new object and return it.
   *
   * @param klass
   * @param type
   */
  allocate(klass: Class, type = ObjectType.REF) {
    const obj = this.newObjectRef(type);
    this.associateClass(obj, klass);
    return obj;
  }

  /**
   * Return the id of the object.
   *
   * @param object
   */
  id(object: ObjectValue): number {
    if (object === null || object === undefined) {
      return NIL_ID;
    }

    if (object === true) {
      return TRUE_ID;
    }

    if (object === false) {
      return FALSE_ID;
    }

    if (typeof object === "number") {
      return object;
    }

    if (typeof object === "string" && !object.startsWith(TAG)) {
      return stringHash(object);
    }

    const [_tag, id, _type, _klass] = object.split("$");
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

    return false;
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

    const [_tag, _id, type, _klass] = object.split("$");
    return Number(type);
  }

  /**
   * Return the class of the object.
   *
   * @param object
   */
  class(object: ObjectValue) {
    if (typeof object === 'string' && object.startsWith(TAG)) {
      const id = this.id(object);
      const klass = this.#pool[id];
      if (klass === undefined) {
        throw new Error(`No class found for object ${object}`);
      }

      return klass;
    }

    let klass = this.#pool[`${object}`];
    if (klass === undefined) {
      klass = this.#pool[`${typeof object}`];
    }
    if (klass === undefined) {
      throw new Error(`No class found for object ${object}`);
    }

    return klass;
  }
}