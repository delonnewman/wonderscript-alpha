import { EOF, Form, isEOF } from "./compiler/core";
import { PushBackReader } from "./reader/PushBackReader";
import { read } from "./reader/read";

export { PushBackReader } from './reader/PushBackReader';
export { read } from "./reader/read";

export type ReadForm = {
  form: Form;
  line: number;
  column: number;
};

export function isReadForm(obj: unknown): obj is ReadForm {
  if (typeof obj !== "object" || obj === null) return false;

  return "form" in obj && "line" in obj && "column" in obj;
}

export function readString(s: string): ReadForm[] {
  const r = new PushBackReader(s);
  const forms: ReadForm[] = [];

  while (true) {
    let form = read(r, { eofIsError: false, eofValue: EOF });
    if (isEOF(form)) return forms;
    if (form != null) forms.push({ form, line: r.line, column: r.column });
  }
}
