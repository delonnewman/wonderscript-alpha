import { Class } from "./Class";

const POOL = [];
const tag = "$wso$";

export const ObjectPool = {
  /**
   * Allocate a new object and return it.
   *
   * @param klass
   */
  allocate(klass: Class) {
    POOL.push(klass);
    return `${tag}${POOL.length - 1}`;
  },

  /**
   * Return the id of the object.
   *
   * @param object
   */
  id(object: string) {
    return Number(object.replace(tag, ""));
  },

  /**
   * Return the class of the object.
   *
   * @param object
   */
  class(object: string) {
    const id = this.id(object);
    const klass = POOL[id];
    if (klass === undefined) {
      throw new Error(`No class found for object ${object}`);
    }
    return klass;
  }
}