import { Symbol } from "./lang/Symbol";
import { Keyword } from "./lang/Keyword";
import { Namespace } from "./lang/Namespace";
import { Vector } from "./lang/Vector";
import { Definition } from "./lang/Definition";
import { Package } from "./lang/Package";
import { Message } from "./lang/Message";
import { ObjectPool } from "./lang/Object";
import { Class } from "./lang/Class";
import {
  False,
  FalseClass,
  Float,
  Nil,
  NilClass,
  PrimitiveType,
  True,
  TrueClass,
  String,
} from "./lang/primitive";

export * from "./lang/Meta";
export * from "./lang/Named";
export * from "./lang/Seq";
export * from "./lang/Sequenceable";
export * from "./lang/Symbol";
export * from "./lang/Keyword";
export * from "./lang/Namespace";
export * from "./lang/runtime";
export * from "./lang/Vector";
export * from "./lang/Package";
export * from "./lang/Definition";
export * from "./lang/Message";
export * from "./lang/Class";
export * from "./lang/Object";
export * from "./lang/primitive";

globalThis.wonderscript ??= {};
globalThis.wonderscript.lang = {
  Symbol,
  Keyword,
  Namespace,
  Vector,
  Module: Package,
  Definition,
  Message,
  Class,
  ObjectPool,
  PrimitiveType,
  Nil,
  NilClass,
  True,
  TrueClass,
  False,
  FalseClass,
  String,
  Float,
};
