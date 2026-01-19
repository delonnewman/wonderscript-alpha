import { PushBackReader } from "./PushBackReader";

export function unmatchedDelimiterReader(
  _r: PushBackReader,
  delim: string,
  _opts: Record<string, unknown>
) {
  throw new Error("Unmatched delimiter: " + delim);
}
