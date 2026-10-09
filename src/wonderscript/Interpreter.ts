import { readString } from "./reader";
import { PrimitiveType } from "./lang/PrimitiveType";
import { Class } from "./lang/Class";
import { ObjectPool } from "./lang/ObjectPool";
import { analyze } from "./analyze";
import { Context } from "./lang/Context";

export class Interpreter {
  #pool: ObjectPool;
  #ctx: Context = new Context();

  constructor() {
    const NilClass = new PrimitiveType("NilClass", "wonderscript.lang");
    const TrueClass = new PrimitiveType("TrueClass", "wonderscript.lang");
    const FalseClass = new PrimitiveType("FalseClass", "wonderscript.lang");
    const Numeric = new PrimitiveType("Numeric", "wonderscript.lang");
    const String = new PrimitiveType("String", "wonderscript.lang");
    const ClassClass = Class.fromJSConstructor(Class, "wonderscript.lang");
    const JSObject = Class.fromJSSingleton(Object, "Object", "js");
    const JSFunction = Class.fromJSConstructor(Function, "js");
    const JSSymbol = Class.fromJSConstructor(Symbol, "js");

    const foundation = {
      null: NilClass,
      undefined: NilClass,
      true: TrueClass,
      false: FalseClass,
      number: Numeric,
      string: String,
      object: JSObject,
      function: JSFunction,
      symbol: JSSymbol,
      Class: ClassClass,
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
    // TODO: pass line and column information to analyze
    return forms.map(f => analyze(f.form))
  }

  evalString(input: string, ctx = this.#ctx) {
    const forms = this.analyzeString(input);
    return forms.map(f => f.dispatch(this.pool, ctx));
  }
}
