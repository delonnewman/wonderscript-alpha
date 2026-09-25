import { PushBackReader } from "./PushBackReader";
import { read } from "./read";
import { EOF, Form, isEOF } from "../compiler/core";

export type ReadForm = {
  form: Form;
  line: number;
  column: number;
};

export function readString(s: string): ReadForm[] {
  const r = new PushBackReader(s);
  const forms = [];

  while (true) {
    let form = read(r, { eofIsError: false, eofValue: EOF });
    if (isEOF(form)) return forms;
    if (form != null) forms.push({ form, line: r.line, column: r.column });
  }
}
