import { Message } from "./Message";
import { ObjectPool } from "./ObjectPool";
import { Context } from "./Context";

export * from "./Dispatch/Action";
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

export interface Dispatch {
  dispatch(pool: ObjectPool, ctx: Context): unknown;
}

export interface SequentialDispatch extends Dispatch {
  then(message: Message): Dispatch;
}

export function isDispatch(obj: unknown): obj is Dispatch {
  return obj != null && typeof (obj as Dispatch).dispatch === "function";
}

// new Script().bind(1, Message.build([Symbol.intern("+"), 1])).then(Message.build([Symbol.intern('*'), 5])).return(new Context()); // => 10
