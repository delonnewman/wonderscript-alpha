import { Message } from "./Message";
import { Named } from "./Named";
import { Class } from "./Class";
import { UnaryMessage } from "./Message/UnaryMessage";
import { ObjectPool, ObjectType, ObjectValue } from "./Object";
import { Package } from "./Package";
import { Array } from "./Array";
import { Hash } from "./Hash";
import { Set } from "./Set";
import { Keyword } from "./Keyword";
import { Symbol } from "./Symbol";

export class PrimitiveType extends Class implements Named, Message {
  #interned: string;

  constructor(obj: ObjectValue, name: string, namespace?: string) {
    super(obj, name, namespace);
    this.#interned = name;
  }

  get interned() {
    return this.#interned;
  }

  allocate() {
    return ObjectPool.allocate(this, ObjectType.VALUE);
  }

  static valueType(value: unknown): Class {
    const type = typeof value;

    if (type === "undefined" || value === null) {
      return NilClass;
    }

    if (type === "boolean") {
      return value ? TrueClass : FalseClass;
    }

    if (type === "string") {
      return String;
    }

    if (type === "number") {
      return Float;
    }

    if (type === "object") {
      // TODO: it will probably make sense to cache type objects
      return Class.fromJSConstructor(value.constructor);
    }

    throw new Error(`unknown type for ${value}`);
  }
}

export const Nil = null;
export const NilClass = PrimitiveType.create('Nil', 'wonderscript.lang');
NilClass.defineMethod(new UnaryMessage('to_s'), () => '');
NilClass.defineMethod(new UnaryMessage("true?"), () => False);
NilClass.defineMethod(new UnaryMessage("false?"), () => True);

export const True = true;
export const TrueClass = PrimitiveType.create('True', 'wonderscript.lang');
TrueClass.defineMethod(new UnaryMessage("to_s"), () => "true");
TrueClass.defineMethod(new UnaryMessage("true?"), () => True);
TrueClass.defineMethod(new UnaryMessage("false?"), () => False);

export const False = false;
export const FalseClass = PrimitiveType.create('False', 'wonderscript.lang');
FalseClass.defineMethod(new UnaryMessage("to_s"), () => "false");
FalseClass.defineMethod(new UnaryMessage("true?"), () => False);
FalseClass.defineMethod(new UnaryMessage("false?"), () => True);

export const Float = PrimitiveType.create('Float', 'wonderscript.lang');
Float.defineMethod(new UnaryMessage("to_s"), (self: number) => `${self}`);
Float.defineMethod(new UnaryMessage("true?"), () => True);
Float.defineMethod(new UnaryMessage("false?"), () => False);

export const String = PrimitiveType.create('String', 'wonderscript.lang');
String.defineMethod(new UnaryMessage("to_s"), (self: string) => self);
String.defineMethod(new UnaryMessage("true?"), () => True);
String.defineMethod(new UnaryMessage("false?"), () => False);

export const JSObject = Class.fromJSSingleton(Object, "Object", "js");
export const JSFunction = Class.fromJSSingleton(Function, "Function", "js");
export const JSMath = Class.fromJSSingleton(Math, "Math", "js");
export const JSConsole = Class.fromJSSingleton(console, "console", "js");
export const ClassPackage = Class.fromJSConstructor(Package, 'wonderscript.lang')

export const ClassArray = Class.fromJSConstructor(Array, 'wonderscript.lang');
export const ClassHash = Class.fromJSConstructor(Hash, "wonderscript.lang");
export const ClassSet = Class.fromJSConstructor(Set, "wonderscript.lang");
export const ClassKeyword = Class.fromJSConstructor(Keyword, "wonderscript.lang");
export const ClassSymbol = Class.fromJSConstructor(Symbol, "wonderscript.lang");
