import { prStr } from "./compiler"

export function p(...args: unknown[]): void {
    console.error(args.map((it) => prStr(it)).join(''));
}
