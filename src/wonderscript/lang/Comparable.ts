export type Order = -1 | 1 | 0;

export interface Comparable<T = unknown> {
  cmp(other: T): Order;
}
