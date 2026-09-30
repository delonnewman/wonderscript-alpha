import { BinaryMessage } from "../Message/BinaryMessage";
import { Dialog } from "../Dispatch/Dialog";
import { UnaryMessage } from "../Message/UnaryMessage";
import { Dispatch } from "../Dispatch";

type PrimitiveType = number | string | boolean | null | undefined | Dispatch;

export const Eval = {
  binaryOp(op: string, x: PrimitiveType, y: PrimitiveType) {
    return new Dialog(x, BinaryMessage.jsOp(op, y));
  },
  unaryOp(op: string, x: PrimitiveType) {
    return new Dialog(x, UnaryMessage.jsOp(op));
  }
};
