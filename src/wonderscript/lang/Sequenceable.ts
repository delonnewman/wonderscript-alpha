import { Seq } from "./Seq";

export interface Sequenceable<T = unknown> {
  seq(): Seq<T>;
}
