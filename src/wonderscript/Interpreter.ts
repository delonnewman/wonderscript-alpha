import { readString } from "./compiler/readString";
import { Dispatch } from "./lang/Dispatch";
import { PrimitiveType } from "./lang/PrimitiveType";
import { UnaryMessage } from "./lang/Message/UnaryMessage";
import { Class } from "./lang/Class";
import { Package } from "./lang/Package";
import { Hash } from "./lang/Hash";
import { Keyword } from "./lang/Keyword";
import { Symbol } from "./lang/Symbol";
import { Set } from "./lang/Set";
import { Array } from "./lang/Array";

export class Interpreter {
  readString(input: string): unknown {
    return readString(input);
  }

  analyzeString(input: string): Dispatch {
    const forms = this.readString(input);
  }
}

export const Nil = null;
export const NilClass = PrimitiveType.create("Nil", "wonderscript.lang");
NilClass.defineMethod(new UnaryMessage("to_s"), () => "");
NilClass.defineMethod(new UnaryMessage("true?"), () => False);
NilClass.defineMethod(new UnaryMessage("false?"), () => True);

export const True = true;
export const TrueClass = PrimitiveType.create("True", "wonderscript.lang");
TrueClass.defineMethod(new UnaryMessage("to_s"), () => "true");
TrueClass.defineMethod(new UnaryMessage("true?"), () => True);
TrueClass.defineMethod(new UnaryMessage("false?"), () => False);

export const False = false;
export const FalseClass = PrimitiveType.create("False", "wonderscript.lang");
FalseClass.defineMethod(new UnaryMessage("to_s"), () => "false");
FalseClass.defineMethod(new UnaryMessage("true?"), () => False);
FalseClass.defineMethod(new UnaryMessage("false?"), () => True);

export const Float = PrimitiveType.create("Float", "wonderscript.lang");
Float.defineMethod(new UnaryMessage("to_s"), (self: number) => `${self}`);
Float.defineMethod(new UnaryMessage("true?"), () => True);
Float.defineMethod(new UnaryMessage("false?"), () => False);

export const String = PrimitiveType.create("String", "wonderscript.lang");
String.defineMethod(new UnaryMessage("to_s"), (self: string) => self);
String.defineMethod(new UnaryMessage("true?"), () => True);
String.defineMethod(new UnaryMessage("false?"), () => False);

export const JSObject = Class.fromJSSingleton(Object, "Object", "js");
export const JSFunction = Class.fromJSSingleton(Function, "Function", "js");
export const JSMath = Class.fromJSSingleton(Math, "Math", "js");
export const JSConsole = Class.fromJSSingleton(console, "console", "js");
export const ClassClass = Class.fromJSConstructor(Class, "wonderscript.lang");
export const ClassPackage = Class.fromJSConstructor(
  Package,
  "wonderscript.lang"
);

export const ClassArray = Class.fromJSConstructor(Array, "wonderscript.lang");
export const ClassHash = Class.fromJSConstructor(Hash, "wonderscript.lang");
export const ClassSet = Class.fromJSConstructor(Set, "wonderscript.lang");
export const ClassKeyword = Class.fromJSConstructor(
  Keyword,
  "wonderscript.lang"
);
export const ClassSymbol = Class.fromJSConstructor(Symbol, "wonderscript.lang");
