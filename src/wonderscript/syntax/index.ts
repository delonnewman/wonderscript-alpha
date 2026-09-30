import { Keyword } from "../lang/Keyword";
import { Vector } from "../lang/Vector";
import { Hash } from "../lang/Hash";
import { Dispatch } from "../lang/Dispatch";
import { Array } from "../lang/Array";
import { Set } from "../lang/Set";

export type SelfEvaluating =
  number | string | null | undefined | boolean | Symbol | Keyword;
export type Collection = Array | Hash | Set | Vector<Syntax>;
export type Syntax = Dispatch | Collection | SelfEvaluating;
