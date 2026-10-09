import {
  BaseDispatch,
  DispatchMessage,
  SequentialDispatch,
} from "../Dispatch";

export class Dialog extends BaseDispatch implements SequentialDispatch {
  then(msg: DispatchMessage) {
    return new Dialog(this, msg);
  }
}
