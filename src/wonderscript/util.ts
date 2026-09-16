import { prStr } from "./compiler";

export function p(...args: unknown[]): void {
  console.error(args.map((it) => prStr(it)).join(""));
}

export function pt(tag: string, ...args: unknown[]): void {
  console.error(`${tag}:`, args.map((it) => prStr(it)).join(""));
}
