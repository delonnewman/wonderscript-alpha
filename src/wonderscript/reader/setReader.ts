import { readDelimitedList } from "./readDelimitedList";
import { PushBackReader } from "./PushBackReader";

export function setReader(
  r: PushBackReader,
  _leftbracket: string,
  opts: Record<string, unknown>
): ReadonlySet<any> {
  const array = readDelimitedList("}", r, true, opts);

  return Object.freeze(new Set(array));
}
