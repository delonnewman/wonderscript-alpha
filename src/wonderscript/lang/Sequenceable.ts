import { Seq } from "./Sequence";

export interface Sequenceable<T = unknown> {
  seq(): Seq<T>;
}
