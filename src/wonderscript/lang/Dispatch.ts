import { Message } from "./Message";
import { ObjectPool, ObjectValue } from "./ObjectPool";
import { Context } from "./Context";
import { Symbol } from "./Symbol";
import { Meta, MetaData } from "./Meta";
import { merge } from "./merge";

export * from "./Dispatch/Binding";
export * from "./Dispatch/Dialog";
export * from "./Dispatch/Script";

/**
 * Example:
 *   (begin
 *     (js/console log "Hi!")
 *     :done)
 *
 * Example:
 *    (let [a 1 b (a + 2)]
 *      (js/console log a b)
 *      (a + b))
 */

export type DispatchSubject = ObjectValue | Symbol | Dispatch;
export type DispatchMessage = Message | Dispatch;

export interface Dispatch {
  dispatch(pool: ObjectPool, ctx: Context): unknown;
}

export interface SequentialDispatch extends Dispatch {
  then(message: DispatchMessage): Dispatch;
}

export function isDispatch(obj: unknown): obj is Dispatch {
  return obj != null && typeof (obj as Dispatch).dispatch === "function";
}