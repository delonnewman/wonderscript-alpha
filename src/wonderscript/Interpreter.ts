import { readString } from "./compiler/readString";
import { PrimitiveType } from "./lang/PrimitiveType";
import { UnaryMessage } from "./lang/Message/UnaryMessage";
import { Class } from "./lang/Class";
import { Package } from "./lang/Package";
import { Hash } from "./lang/Hash";
import { Keyword } from "./lang/Keyword";
import { Symbol } from "./lang/Symbol";
import { Set } from "./lang/Set";
import { Array } from "./lang/Array";
import { ObjectPool } from "./lang/ObjectPool";

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

    this.#pool = new ObjectPool(NilClass, TrueClass, FalseClass, Float, String);

    this.#corePkg = buildCorePackage(NilClass, TrueClass, FalseClass, Float, String);
    this.#jsPkg = buildJSPackage();
  }

  readString(input: string): unknown {
    return readString(input);
  }

  analyzeString(input: string) {
    const forms = this.readString(input);
  }
}

export function buildCorePackage(NilClass: PrimitiveType, TrueClass: PrimitiveType, FalseClass: PrimitiveType, Float: PrimitiveType, String: PrimitiveType) {
  const pkg = new Package(Symbol.intern("WonderScript::Core"));

  NilClass.defineMethod(new UnaryMessage("to_s"), () => "");
  NilClass.defineMethod(new UnaryMessage("true?"), () => false);
  NilClass.defineMethod(new UnaryMessage("false?"), () => true);
  pkg.importSymbol(Symbol.intern("NilClass"), NilClass);

  TrueClass.defineMethod(new UnaryMessage("to_s"), () => "true");
  TrueClass.defineMethod(new UnaryMessage("true?"), () => true);
  TrueClass.defineMethod(new UnaryMessage("false?"), () => false);
  pkg.importSymbol(Symbol.intern("TrueClass"), TrueClass);

  FalseClass.defineMethod(new UnaryMessage("to_s"), () => "false");
  FalseClass.defineMethod(new UnaryMessage("true?"), () => false);
  FalseClass.defineMethod(new UnaryMessage("false?"), () => true);
  pkg.importSymbol(Symbol.intern("FalseClass"), FalseClass);

  Float.defineMethod(new UnaryMessage("to_s"), (self: number) => `${self}`);
  Float.defineMethod(new UnaryMessage("true?"), () => true);
  Float.defineMethod(new UnaryMessage("false?"), () => false);
  pkg.importSymbol(Symbol.intern("Float"), Float);

  String.defineMethod(new UnaryMessage("to_s"), (self: string) => self);
  String.defineMethod(new UnaryMessage("true?"), () => true);
  String.defineMethod(new UnaryMessage("false?"), () => false);
  pkg.importSymbol(Symbol.intern("String"), String);

  const ClassArray = Class.fromJSConstructor(Array, "wonderscript.lang");
  pkg.importSymbol(Symbol.intern("Array"), ClassArray);

  const ClassHash = Class.fromJSConstructor(Hash, "wonderscript.lang");
  pkg.importSymbol(Symbol.intern("Hash"), ClassHash);

  const ClassSet = Class.fromJSConstructor(Set, "wonderscript.lang");
  pkg.importSymbol(Symbol.intern("Set"), ClassSet);

  const ClassKeyword = Class.fromJSConstructor(
    Keyword,
    "wonderscript.lang"
  );
  pkg.importSymbol(Symbol.intern("Keyword"), ClassKeyword);

  const ClassSymbol = Class.fromJSConstructor(
    Symbol,
    "wonderscript.lang"
  );
  pkg.importSymbol(Symbol.intern("Symbol"), ClassSymbol);

  const ClassClass = Class.fromJSConstructor(Class, "wonderscript.lang");
  pkg.importSymbol(Symbol.intern("Class"), ClassClass);

  const ClassPackage = Class.fromJSConstructor(
    Package,
    "wonderscript.lang"
  );
  pkg.importSymbol(Symbol.intern("Package"), ClassPackage);

  return pkg;
}

export function buildJSPackage() {
  const pkg = new Package(Symbol.intern("WonderScript::JS"));

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

