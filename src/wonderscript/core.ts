import { JSClassMixin } from "./lang/Method";
import { Class } from "./lang/Class";
import { Symbol } from "./lang/Symbol";
import { Keyword } from "./lang/Keyword";
import { Array } from "./lang/Array";
import { Hash } from "./lang/Hash";
import { Vector } from "./lang/Vector";
import { Set } from "./lang/Set";
import { UnaryMessage } from "./lang/Message/UnaryMessage";
import { BinaryMessage } from "./lang/Message/BinaryMessage";
import { ArgListMessage } from "./lang/Message/ArgListMessage";
import { Dialog } from "./lang/Dispatch/Dialog";
import { Script } from "./lang/Dispatch/Script";

Object.assign(Class, JSClassMixin);
Object.assign(Symbol, JSClassMixin);
Object.assign(Keyword, JSClassMixin);
Object.assign(Array, JSClassMixin);
Object.assign(Hash, JSClassMixin);
Object.assign(Vector, JSClassMixin);
Object.assign(Set, JSClassMixin);
Object.assign(UnaryMessage, JSClassMixin);
Object.assign(BinaryMessage, JSClassMixin);
Object.assign(ArgListMessage, JSClassMixin);
Object.assign(Dialog, JSClassMixin);
Object.assign(Script, JSClassMixin);

export {
  Class,
  Symbol,
  Keyword,
  Array,
  Hash,
  Vector,
  Set,
  UnaryMessage,
  BinaryMessage,
  ArgListMessage,
  Dialog,
  Script
};