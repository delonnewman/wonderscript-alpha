import { Sequence } from "./Sequence";

export interface Sequenceable<T = unknown> {
  seq(): Sequence<T>;
}
