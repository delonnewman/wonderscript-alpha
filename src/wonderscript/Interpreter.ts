import { readString } from "./reader";
import { ObjectPool, ObjectValue } from "./lang/ObjectPool";
import { analyze } from "./analyze";
import { Context } from "./lang/Context";
import { UnaryMessage } from "./lang/Message/UnaryMessage";
import { Dialog } from "./lang/Dispatch/Dialog";
import { BinaryMessage } from "./lang/Message/BinaryMessage";
import {
  Class,
  Keyword,
  Symbol,
  Array,
  Hash,
  Vector,
  Set,
  ArgListMessage,
  Script,
} from "./core";
import { KeywordMessage } from "./lang/Message/KeywordMessage";
import { Platform } from "./compiler/platforms";
import fs from "fs";
import { Form } from "./compiler/core";

export class Interpreter {
  #pool: ObjectPool;
  #ctx: Context = new Context();
  #platform: Platform;
  #global: typeof globalThis;

  constructor(platform: Platform, global: typeof globalThis) {
    this.#platform = platform;
    this.#global = global;

    const NotMessage = new UnaryMessage("!");
    const TruthyNotDispatch = {
      dispatch(_pool: ObjectPool, ctx: Context): unknown {
        const self = ctx.get("self");
        if (self === undefined) {
          throw new Error(`expected 'self' in context ${ctx}`);
        }

        return false;
      },
    };

    const Object = new Class("Object");
    Object.defineMethod(NotMessage, TruthyNotDispatch);

    Object.defineMethod(new UnaryMessage("inspect"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        const self = ctx.get("self");
        if (self === undefined) {
          throw new Error(`expected 'self' in context ${ctx}`);
        }

        const id = pool.id(self as ObjectValue);
        return `#<Object ${id}>`;
      },
    });

    Object.defineMethod(new UnaryMessage("class"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        const self = ctx.get("self");
        if (self === undefined) {
          throw new Error(`expected 'self' in context ${ctx}`);
        }

        return pool.class(self as ObjectValue);
      },
    });

    Object.defineMethod(new UnaryMessage("allocate"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        const self = ctx.get("self");
        if (self === undefined) {
          throw new Error(`expected 'self' in context ${ctx}`);
        }

        const klass = new Dialog(
          self as ObjectValue,
          new UnaryMessage("class")
        ).dispatch(pool, ctx);

        return pool.allocate(klass as Class);
      },
    });

    const NilClass = Object.subclass(Symbol.intern("NilClass"));
    NilClass.defineMethod(new UnaryMessage("inspect"), {
      dispatch(_pool: ObjectPool, _ctx: Context): unknown {
        return "nil";
      },
    });

    const FalsyNotDispatch = {
      dispatch(_pool: ObjectPool, ctx: Context): unknown {
        const self = ctx.get("self");
        if (self === undefined) {
          throw new Error(`expected 'self' in context ${ctx}`);
        }

        return true;
      },
    };

    NilClass.defineMethod(NotMessage, FalsyNotDispatch);

    const TrueClass = Object.subclass(Symbol.intern("TrueClass"));
    TrueClass.defineMethod(new UnaryMessage("inspect"), {
      dispatch(_pool: ObjectPool, _ctx: Context): unknown {
        return "true";
      },
    });

    const FalseClass = Object.subclass(Symbol.intern("FalseClass"));
    FalseClass.defineMethod(new UnaryMessage("inspect"), {
      dispatch(_pool: ObjectPool, _ctx: Context): unknown {
        return "false";
      },
    });

    FalseClass.defineMethod(NotMessage, FalsyNotDispatch);

    const AndMessage = new BinaryMessage(
      "&&",
      undefined,
      Symbol.intern("other")
    );
    const AndDispatch = {
      dispatch(_pool: ObjectPool, ctx: Context): unknown {
        const self = ctx.get("self");
        if (self == null) {
          throw new Error(`expected 'self' in context ${ctx}`);
        }

        const other = ctx.get("other");
        if (other == null) {
          throw new Error("'other' is required");
        }

        return self && other;
      },
    };

    FalseClass.defineMethod(AndMessage, AndDispatch);
    TrueClass.defineMethod(AndMessage, AndDispatch);

    const OrMessage = new BinaryMessage(
      "||",
      undefined,
      Symbol.intern("other")
    );
    const OrDispatch = {
      dispatch(_pool: ObjectPool, ctx: Context): unknown {
        const self = ctx.get("self");
        if (self == null) {
          throw new Error(`expected 'self' in context ${ctx}`);
        }

        const other = ctx.get("other");
        if (other == null) {
          throw new Error("'other' is required");
        }

        return self || other;
      },
    };

    FalseClass.defineMethod(OrMessage, OrDispatch);
    TrueClass.defineMethod(OrMessage, OrDispatch);

    const Numeric = Object.subclass(Symbol.intern("Numeric"));
    Numeric.defineMethod(new UnaryMessage("inspect"), {
      dispatch(_pool: ObjectPool, ctx: Context): unknown {
        const self = ctx.get("self");
        if (self == null) {
          throw new Error(`expected 'self' in context ${ctx}`);
        }

        return `${self}`;
      },
    });

    Numeric.defineMethod(
      new BinaryMessage("+", undefined, Symbol.intern("other")),
      {
        dispatch(pool: ObjectPool, ctx: Context): unknown {
          const self = ctx.get("self") as number;
          if (self == null) {
            throw new Error(`expected 'self' in context ${ctx}`);
          }

          const other = ctx.get("other") as number;
          if (other == null) {
            throw new Error("'other' is required");
          }

          return self + other;
        },
      }
    );

    Numeric.defineMethod(
      new BinaryMessage("-", undefined, Symbol.intern("other")),
      {
        dispatch(pool: ObjectPool, ctx: Context): unknown {
          const self = ctx.get("self") as number;
          if (self == null) {
            throw new Error(`expected 'self' in context ${ctx}`);
          }

          const other = ctx.get("other") as number;
          if (other == null) {
            throw new Error("'other' is required");
          }

          return self - other;
        },
      }
    );

    Numeric.defineMethod(
      new BinaryMessage("*", undefined, Symbol.intern("other")),
      {
        dispatch(pool: ObjectPool, ctx: Context): unknown {
          const self = ctx.get("self") as number;
          if (self == null) {
            throw new Error(`expected 'self' in context ${ctx}`);
          }

          const other = ctx.get("other") as number;
          if (other == null) {
            throw new Error("'other' is required");
          }

          return self * other;
        },
      }
    );

    Numeric.defineMethod(
      new BinaryMessage("/", undefined, Symbol.intern("other")),
      {
        dispatch(pool: ObjectPool, ctx: Context): unknown {
          const self = ctx.get("self") as number;
          if (self == null) {
            throw new Error(`expected 'self' in context ${ctx}`);
          }

          const other = ctx.get("other") as number;
          if (other == null) {
            throw new Error("'other' is required");
          }

          return self / other;
        },
      }
    );

    Numeric.defineMethod(
      new BinaryMessage("%", undefined, Symbol.intern("other")),
      {
        dispatch(pool: ObjectPool, ctx: Context): unknown {
          const self = ctx.get("self") as number;
          if (self == null) {
            throw new Error(`expected 'self' in context ${ctx}`);
          }

          const other = ctx.get("other") as number;
          if (other == null) {
            throw new Error("'other' is required");
          }

          return self % other;
        },
      }
    );

    Numeric.defineMethod(
      new BinaryMessage(">", undefined, Symbol.intern("other")),
      {
        dispatch(pool: ObjectPool, ctx: Context): unknown {
          const self = ctx.get("self") as number;
          if (self == null) {
            throw new Error(`expected 'self' in context ${ctx}`);
          }

          const other = ctx.get("other") as number;
          if (other == null) {
            throw new Error("'other' is required");
          }

          return self > other;
        },
      }
    );

    Numeric.defineMethod(
      new BinaryMessage(">=", undefined, Symbol.intern("other")),
      {
        dispatch(pool: ObjectPool, ctx: Context): unknown {
          const self = ctx.get("self") as number;
          if (self == null) {
            throw new Error(`expected 'self' in context ${ctx}`);
          }

          const other = ctx.get("other") as number;
          if (other == null) {
            throw new Error("'other' is required");
          }

          return self >= other;
        },
      }
    );

    Numeric.defineMethod(
      new BinaryMessage("<", undefined, Symbol.intern("other")),
      {
        dispatch(pool: ObjectPool, ctx: Context): unknown {
          const self = ctx.get("self") as number;
          if (self == null) {
            throw new Error(`expected 'self' in context ${ctx}`);
          }

          const other = ctx.get("other") as number;
          if (other == null) {
            throw new Error("'other' is required");
          }

          return self < other;
        },
      }
    );

    Numeric.defineMethod(
      new BinaryMessage("<=", undefined, Symbol.intern("other")),
      {
        dispatch(pool: ObjectPool, ctx: Context): unknown {
          const self = ctx.get("self") as number;
          if (self == null) {
            throw new Error(`expected 'self' in context ${ctx}`);
          }

          const other = ctx.get("other") as number;
          if (other == null) {
            throw new Error("'other' is required");
          }

          return self <= other;
        },
      }
    );

    const String = Object.subclass(Symbol.intern("String"));
    String.defineMethod(new UnaryMessage("inspect"), {
      dispatch(_pool: ObjectPool, ctx: Context): unknown {
        const self = ctx.get("self");
        if (self == null) {
          throw new Error(`expected 'self' in context ${ctx}`);
        }

        return JSON.stringify(self);
      },
    });

    const foundation = {
      null: NilClass,
      undefined: NilClass,
      true: TrueClass,
      false: FalseClass,
      type_string: String,
      type_number: Numeric,
      Numeric,
      String,
      FalseClass,
      TrueClass,
      NilClass,
    };

    this.#pool = new ObjectPool(foundation);

    const JSClass = Object.subclass("JSClass");
    JSClass.defineMethod(new UnaryMessage("inspect"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        return "#<JS>";
      },
    });

    const self = this;

    JSClass.defineMethod(new UnaryMessage("console"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        return self.#global.console;
      },
    });

    JSClass.defineMethod(new UnaryMessage("Math"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        return self.#global.Math;
      },
    });

    JSClass.defineMethod(new UnaryMessage("Object"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        return self.#global.Object;
      },
    });

    JSClass.defineMethod(new UnaryMessage("Function"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        return self.#global.Function;
      },
    });

    JSClass.defineMethod(new UnaryMessage("Array"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        return self.#global.Array;
      },
    });

    JSClass.defineMethod(new UnaryMessage("globalThis"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        return self.#global;
      },
    });

    JSClass.defineMethod(
      new BinaryMessage("typeof", undefined, Symbol.intern("other")),
      {
        dispatch(pool: ObjectPool, ctx: Context): unknown {
          const other = ctx.get("other");
          if (other === undefined) {
            throw new Error("'other' is required");
          }

          return typeof other;
        },
      }
    );

    const js = this.#pool.allocate(JSClass);
    this.#ctx.define(Symbol.intern("JS"), js);
    this.#ctx.define(Symbol.intern("WS"), this);
    this.#ctx.define(Symbol.intern("Object"), Object);
    this.#ctx.define(Symbol.intern("NilClass"), NilClass);
    this.#ctx.define(Symbol.intern("TrueClass"), TrueClass);
    this.#ctx.define(Symbol.intern("FalseClass"), FalseClass);
    this.#ctx.define(Symbol.intern("Numeric"), Numeric);
    this.#ctx.define(Symbol.intern("String"), String);
    this.#ctx.define(Symbol.intern("Symbol"), Symbol);
    this.#ctx.define(Symbol.intern("Keyword"), Keyword);
    this.#ctx.define(Symbol.intern("Array"), Array);
    this.#ctx.define(Symbol.intern("Vector"), Vector);
    this.#ctx.define(Symbol.intern("Hash"), Hash);
    this.#ctx.define(Symbol.intern("Set"), Set);
    this.#ctx.define(Symbol.intern("UnaryMessage"), UnaryMessage);
    this.#ctx.define(Symbol.intern("BinaryMessage"), BinaryMessage);
    this.#ctx.define(Symbol.intern("ArgListMessage"), ArgListMessage);
    this.#ctx.define(Symbol.intern("KeywordMessage"), KeywordMessage);
    this.#ctx.define(Symbol.intern("Dialog"), Dialog);
    this.#ctx.define(Symbol.intern("Script"), Script);
  }

  get platform() {
    return this.#platform;
  }

  get pool() {
    return this.#pool;
  }

  inspect() {
    return `#<Interpreter ${this.#platform}>`;
  }

  isNode(): boolean {
    return this.#platform === Platform.Node;
  }

  isBrowser(): boolean {
    return this.#platform === Platform.Browser;
  }

  readString(input: string) {
    return readString(input);
  }

  analyzeString(input: string) {
    const forms = this.readString(input);
    return forms.map(analyze);
  }

  evalString(input: string) {
    const forms = this.analyzeString(input);
    let result;
    // TODO: construct a global script object and dispatch it
    forms.forEach((f) => {
      result = f.dispatch(this.pool, this.#ctx);
    });
    return result;
  }

  eval(input: Form) {
    return analyze(input).dispatch(this.pool, this.#ctx);
  }

  loadFile(path: string) {
    if (this.isNode()) {
      this.evalString(this.#slurp(path));
    }

    if (this.isBrowser()) {
      this.#fetchFile(path).then((text) => this.evalString(text));
    }

    return this;
  }

  #slurp(path: string): string {
    // @ts-ignore
    const fs = require("fs");
    return fs.readFileSync(path, "utf8");
  }

  #fetchFile(path: string): Promise<string> {
    return fetch(path).then((res) => res.text());
  }
}
