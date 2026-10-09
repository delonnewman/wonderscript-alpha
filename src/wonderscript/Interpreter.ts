import { readString } from "./reader";
import { Class } from "./lang/Class";
import { ObjectPool } from "./lang/ObjectPool";
import { analyze } from "./analyze";
import { Context } from "./lang/Context";

export class Interpreter {
  #pool: ObjectPool;
  #ctx: Context = new Context();

  constructor() {
    const NilClass = new Class("NilClass", "wonderscript.lang");
    const TrueClass = new Class("TrueClass", "wonderscript.lang");
    const FalseClass = new Class("FalseClass", "wonderscript.lang");
    const Numeric = new Class("Numeric", "wonderscript.lang");
    const String = new Class("String", "wonderscript.lang");

    const foundation = {
      null: NilClass,
      undefined: NilClass,
      true: TrueClass,
      false: FalseClass,
      number: Numeric,
      string: String,
      Numeric,
      String,
      FalseClass,
      TrueClass,
      NilClass,
    };

    this.#pool = new ObjectPool(foundation);
  }

  get pool() { return this.#pool }

  readString(input: string) {
    return readString(input);
  }

  analyzeString(input: string) {
    const forms = this.readString(input);
    return forms.map(analyze);
  }

  evalString(input: string, ctx = this.#ctx) {
    const forms = this.analyzeString(input);
    let result;
    forms.forEach(f => {
      result = f.dispatch(this.pool, ctx);
    });
    return result;
  }
}
