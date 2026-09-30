import { readString } from "./reader";
import { PrimitiveType } from "./lang/PrimitiveType";
import { UnaryMessage } from "./lang/Message/UnaryMessage";
import { Class } from "./lang/Class";
import { Package } from "./lang/Package";
import { Hash } from "./lang/Hash";
import { Keyword } from "./lang/Keyword";
import { Symbol } from "./lang/Symbol";
import { Set } from "./lang/Set";
import { Array } from "./lang/Array";
import { Foundation, ObjectPool } from "./lang/ObjectPool";
import { Vector } from "./lang/Vector";
import { BinaryMessage } from "./lang/Message/BinaryMessage";
import { Form } from "./compiler/core";
import { analyze } from "./analyze";
import { Context } from "./lang/Context";
import { isDispatch } from "./lang/Dispatch";

export class Interpreter {
  #pool: ObjectPool;
  #corePkg: Package;
  #jsPkg: Package;

  constructor() {
    const NilClass = new PrimitiveType("NilClass", "wonderscript.lang");
    const TrueClass = new PrimitiveType("TrueClass", "wonderscript.lang");
    const FalseClass = new PrimitiveType("FalseClass", "wonderscript.lang");
    const Float = new PrimitiveType("Float", "wonderscript.lang");
    const String = new PrimitiveType("String", "wonderscript.lang");
    const ClassClass = Class.fromJSConstructor(Class, "wonderscript.lang");
    const ClassArray = Class.fromJSConstructor(Array, "wonderscript.lang");
    const ClassHash = Class.fromJSConstructor(Hash, "wonderscript.lang");
    const ClassSet = Class.fromJSConstructor(Set, "wonderscript.lang");
    const ClassKeyword = Class.fromJSConstructor(Keyword, "wonderscript.lang");
    const ClassSymbol = Class.fromJSConstructor(Symbol, "wonderscript.lang");
    const ClassVector = Class.fromJSConstructor(Vector, "wonderscript.lang");

    const foundation = {
      NilClass,
      TrueClass,
      FalseClass,
      Float,
      String,
      Symbol: ClassSymbol,
      Class: ClassClass,
      Keyword: ClassKeyword,
      Array: ClassArray,
      Hash: ClassHash,
      Set: ClassSet,
      Vector: ClassVector,
    };

    this.#pool = new ObjectPool(foundation);
    this.#corePkg = buildCorePackage(foundation);
    this.#jsPkg = buildJSPackage();
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

  evalString(input: string, ctx = new Context()) {
    const forms = this.analyzeString(input);
    return forms.map(f => isDispatch(f) ? f.dispatch(this.pool, ctx) : f);
  }
}

const binaryMethod = (self: Form, msg: BinaryMessage) => msg.sendTo(self);

export function buildCorePackage(foundation: Foundation) {
  const pkg = new Package(Symbol.intern("wonderscript.core"));

  foundation.NilClass.defineMethod(Symbol.intern("to_s"), () => "");
  foundation.NilClass.defineMethod(Symbol.intern("true?"), () => false);
  foundation.NilClass.defineMethod(Symbol.intern("false?"), () => true);
  pkg.importSymbol(Symbol.intern("NilClass"), foundation.NilClass);

  foundation.TrueClass.defineMethod(Symbol.intern("to_s"), () => "true");
  foundation.TrueClass.defineMethod(Symbol.intern("true?"), () => true);
  foundation.TrueClass.defineMethod(Symbol.intern("false?"), () => false);
  pkg.importSymbol(Symbol.intern("TrueClass"), foundation.TrueClass);

  foundation.FalseClass.defineMethod(Symbol.intern("to_s"), () => "false");
  foundation.FalseClass.defineMethod(Symbol.intern("true?"), () => false);
  foundation.FalseClass.defineMethod(Symbol.intern("false?"), () => true);
  pkg.importSymbol(Symbol.intern("FalseClass"), foundation.FalseClass);

  foundation.Float.defineMethod(Symbol.intern("to_s"), (self: number) => `${self}`);
  foundation.Float.defineMethod(Symbol.intern("true?"), () => true);
  foundation.Float.defineMethod(Symbol.intern("false?"), () => false);
  foundation.Float.defineMethod(
    new BinaryMessage("+", undefined, Symbol.intern('x')),
    binaryMethod,
  );
  foundation.Float.defineMethod(
    new BinaryMessage("-", undefined, Symbol.intern("x")),
    binaryMethod
  );
  foundation.Float.defineMethod(
    new BinaryMessage("*", undefined, Symbol.intern("x")),
    binaryMethod
  );
  foundation.Float.defineMethod(
    new BinaryMessage("/", undefined, Symbol.intern("x")),
    binaryMethod
  );
  foundation.Float.defineMethod(
    new BinaryMessage("%", undefined, Symbol.intern("x")),
    binaryMethod
  );
  includeComparable(foundation.Float);
  pkg.importSymbol(Symbol.intern("Float"), foundation.Float);

  foundation.String.defineMethod(Symbol.intern("to_s"), (self: string) => self);
  foundation.String.defineMethod(Symbol.intern("true?"), () => true);
  foundation.String.defineMethod(Symbol.intern("false?"), () => false);
  includeComparable(foundation.String);
  pkg.importSymbol(Symbol.intern("String"), foundation.String);

  pkg.importSymbol(Symbol.intern("Array"), foundation.Array);
  pkg.importSymbol(Symbol.intern("Hash"), foundation.Hash);
  pkg.importSymbol(Symbol.intern("Set"), foundation.Set);
  pkg.importSymbol(Symbol.intern("Keyword"), foundation.Keyword);
  pkg.importSymbol(Symbol.intern("Symbol"), foundation.Symbol);

  const ClassClass = Class.fromJSConstructor(Class, "wonderscript.lang");
  pkg.importSymbol(Symbol.intern("Class"), foundation.Class);

  const ClassPackage = Class.fromJSConstructor(
    Package,
    "wonderscript.lang"
  );
  pkg.importSymbol(Symbol.intern("Package"), ClassPackage);

  return pkg;
}

function includeComparable(klass: Class) {
  // TODO: add <=> and ==
  klass.defineMethod(
    new BinaryMessage("<", undefined, Symbol.intern("x")),
    binaryMethod,
  );
  klass.defineMethod(
    new BinaryMessage(">", undefined, Symbol.intern("x")),
    binaryMethod
  );
  klass.defineMethod(
    new BinaryMessage(">=", undefined, Symbol.intern("x")),
    binaryMethod
  );
  klass.defineMethod(
    new BinaryMessage("<=", undefined, Symbol.intern("x")),
    binaryMethod
  );
}

export function buildJSPackage() {
  const pkg = new Package(Symbol.intern("js"));

  const JSObject = Class.fromJSSingleton(Object, "Object");
  pkg.importSymbol(Symbol.intern("JSObject"), JSObject);

  const JSFunction = Class.fromJSConstructor(Function);
  pkg.importSymbol(Symbol.intern("JSFunction"), JSFunction);

  const JSMath = Class.fromJSSingleton(Math, "Math");
  pkg.importSymbol(Symbol.intern("JSMath"), JSMath);

  const JSConsole = Class.fromJSSingleton(console, "console");
  pkg.importSymbol(Symbol.intern("JSConsole"), JSConsole);

  return pkg;
}

