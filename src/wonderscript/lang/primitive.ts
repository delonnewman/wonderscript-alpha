import { Message } from "./Message";
import { Named } from "./Named";
import { Class } from "./Class";
import { UnaryMessage } from "./Message/UnaryMessage";

export class PrimitiveType extends Class implements Named, Message {
  #interned: string;

  constructor(name: string, namespace?: string) {
    super(name, namespace);
    this.#interned = name;
    Object.freeze(this);
  }

  get interned() {
    return this.#interned;
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

    if (type === 'number') {
      return Float;
    }

    if (type === "object") {
      // TODO: it will probably make sense to cache type objects
      return Class.fromJS(value.constructor);
    }

    throw new Error(`unknown type for ${value}`);
  }
}

export const NilClass = new PrimitiveType('Nil', 'wonderscript.lang');
NilClass.defineMethod(new UnaryMessage('to_s'), () => '');
NilClass.defineMethod(new UnaryMessage("true?"), () => False);
NilClass.defineMethod(new UnaryMessage("false?"), () => True);
export const Nil = NilClass.allocate();

export const TrueClass = new PrimitiveType('True', 'wonderscript.lang');
TrueClass.defineMethod(new UnaryMessage("to_s"), () => "true");
TrueClass.defineMethod(new UnaryMessage("true?"), () => True);
TrueClass.defineMethod(new UnaryMessage("false?"), () => False);
export const True = TrueClass.allocate();

export const FalseClass = new PrimitiveType('False', 'wonderscript.lang');
FalseClass.defineMethod(new UnaryMessage("to_s"), () => "false");
FalseClass.defineMethod(new UnaryMessage("true?"), () => False);
FalseClass.defineMethod(new UnaryMessage("false?"), () => True);
export const False = FalseClass.allocate();

export const Float = new PrimitiveType('Float', 'wonderscript.lang');
Float.defineMethod(new UnaryMessage("to_s"), (self: number) => `${self}`);
Float.defineMethod(new UnaryMessage("true?"), () => True);
Float.defineMethod(new UnaryMessage("false?"), () => False);

export const String = new PrimitiveType('String', 'wonderscript.lang');
String.defineMethod(new UnaryMessage("to_s"), (self: string) => self);
String.defineMethod(new UnaryMessage("true?"), () => True);
String.defineMethod(new UnaryMessage("false?"), () => False);
