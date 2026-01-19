import { PushBackReader } from "./PushBackReader";

export function commentReader(
  r: PushBackReader,
  _semicolon: string,
  _opts: Record<string, unknown>
) {
  let ch: string | null;

  do {
    ch = r.read();
  } while (ch !== null && ch !== "\n" && ch !== "\r");

  return r;
}
