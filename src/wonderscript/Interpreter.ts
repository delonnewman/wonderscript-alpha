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
import { Form } from "./compiler/core";
import { Message } from "./lang/Message";
import { Dispatch } from "./lang/Dispatch";
import { pt } from "./util";

export class Interpreter {
  #pool: ObjectPool;
  #ctx: Context = new Context();
  #platform: Platform;
  #global: typeof globalThis;

  constructor(platform: Platform, global: typeof globalThis) {
    this.#platform = platform;
    this.#global = global;

    const self = this;

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

        const klass = pool.class(self as ObjectValue);
        const classObj = ctx.get(klass.name);
        if (classObj === undefined) {
          throw new Error(`expected '${klass.name}' in context ${ctx}`);
        }

        return classObj;
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
    };

    this.#pool = new ObjectPool(foundation);

    const JSClass = Object.subclass("JSClass");
    JSClass.defineMethod(new UnaryMessage("inspect"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        return "#<JS>";
      },
    });

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

    const ClassObject = Object.subclass(Symbol.intern("Class"));
    ClassObject.defineMethod(new UnaryMessage("inspect"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        const self = ctx.get("self") as ObjectValue;
        if (self === undefined) {
          throw new Error(`expected 'self' in context ${ctx}`);
        }

        return pool.attribute_value_get(self, "name");
      },
    });

    ClassObject.defineMethod(new UnaryMessage("allocate"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        const self = ctx.get("self") as ObjectValue;
        if (self === undefined) {
          throw new Error(`expected 'self' in context ${ctx}`);
        }

        const table = pool.attribute_value_get(self, "table");
        return pool.allocate(table as Class);
      },
    });

    ClassObject.defineMethod(new UnaryMessage("name"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        const self = ctx.get("self") as ObjectValue;
        if (self === undefined) {
          throw new Error(`expected 'self' in context ${ctx}`);
        }

        return pool.attribute_value_get(self, "name");
      },
    });

    ClassObject.defineMethod(new UnaryMessage("instance-messages"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        const self = ctx.get("self") as ObjectValue;
        if (self === undefined) {
          throw new Error(`expected 'self' in context ${ctx}`);
        }

        const table = pool.attribute_value_get(self, "table") as Class;
        return table.messages;
      },
    });

    ClassObject.defineMethod(
      new ArgListMessage("define-method", undefined, [
        Symbol.intern("message"),
        Symbol.intern("dispatch"),
      ]),
      {
        dispatch(pool: ObjectPool, ctx: Context): unknown {
          const self = ctx.get("self") as ObjectValue;
          if (self === undefined) {
            throw new Error(`expected 'self' in context ${ctx}`);
          }

          const msg = ctx.get('message') as Message;
          if (msg === undefined) {
            throw new Error(`expected 'message' in context ${ctx}`);
          }

          const dispatch = ctx.get("dispatch") as Dispatch;
          if (dispatch === undefined) {
            throw new Error(`expected 'dispatch' in context ${ctx}`);
          }

          const table = pool.attribute_value_get(self, "table") as Class;
          return table.defineMethod(msg, dispatch);
        },
      }
    );

    ClassObject.defineMethod(new BinaryMessage("subclass", undefined,
        Symbol.intern("name"),
      ),
      {
        dispatch(pool: ObjectPool, ctx: Context): unknown {
          const self = ctx.get("self") as ObjectValue;
          if (self === undefined) {
            throw new Error(`expected 'self' in context ${ctx}`);
          }

          const name = ctx.get("name") as string;
          if (name === undefined) {
            throw new Error(`expected 'name' in context ${ctx}`);
          }

          const table = pool.attribute_value_get(self, "table") as Class;
          const subclassTable = table.subclass(name);
          const subclassObject = pool.allocate(ClassObject);
          pool.attribute_value_set(subclassObject, "name", name);
          pool.attribute_value_set(subclassObject, "table", subclassTable);
          return subclassObject;
        }
      }
  )

    const $Object = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($Object, "name", "Object");
    this.pool.attribute_value_set($Object, "table", Object);

    const $NilClass = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($NilClass, "name", "NilClass");
    this.pool.attribute_value_set($NilClass, "table", NilClass);

    const $TrueClass = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($TrueClass, "name", "TrueClass");
    this.pool.attribute_value_set($TrueClass, "table", TrueClass);

    const $FalseClass = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($FalseClass, "name", "FalseClass");
    this.pool.attribute_value_set($FalseClass, "table", FalseClass);

    const $Numeric = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($Numeric, "name", "Numeric");
    this.pool.attribute_value_set($Numeric, "table", Numeric);

    const $String = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($String, "name", "String");
    this.pool.attribute_value_set($String, "table", String);

    const $Symbol = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($Symbol, "name", "Symbol");
    this.pool.attribute_value_set($Symbol, "table", Symbol);

    const $Keyword = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($Keyword, "name", "Keyword");
    this.pool.attribute_value_set($Keyword, "table", Keyword);

    const $Array = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($Array, "name", "Array");
    this.pool.attribute_value_set($Array, "table", Array);

    const $Vector = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($Vector, "name", "Vector");
    this.pool.attribute_value_set($Vector, "table", Vector);

    const $Hash = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($Hash, "name", "Hash");
    this.pool.attribute_value_set($Hash, "table", Hash);

    const $Set = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($Set, "name", "Set");
    this.pool.attribute_value_set($Set, "table", Set);

    const $UnaryMessage = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($UnaryMessage, "name", "UnaryMessage");
    this.pool.attribute_value_set($UnaryMessage, "table", UnaryMessage);

    const $BinaryMessage = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($BinaryMessage, "name", "BinaryMessage");
    this.pool.attribute_value_set($BinaryMessage, "table", BinaryMessage);

    const $ArgListMessage = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($ArgListMessage, "name", "ArgListMessage");
    this.pool.attribute_value_set($ArgListMessage, "table", ArgListMessage);

    const $KeywordMessage = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($KeywordMessage, "name", "KeywordMessage");
    this.pool.attribute_value_set($KeywordMessage, "table", KeywordMessage);

    const $Dialog = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($Dialog, "name", "Dialog");
    this.pool.attribute_value_set($Dialog, "table", Dialog);

    const $Script = this.pool.allocate(ClassObject);
    this.pool.attribute_value_set($Script, "name", "Script");
    this.pool.attribute_value_set($Script, "table", Script);

    const js = this.#pool.allocate(JSClass);
    this.#ctx.define(Symbol.intern("JS"), js);
    this.#ctx.define(Symbol.intern("WS"), this);
    this.#ctx.define(Symbol.intern("Object"), $Object);
    this.#ctx.define(Symbol.intern("NilClass"), $NilClass);
    this.#ctx.define(Symbol.intern("TrueClass"), $TrueClass);
    this.#ctx.define(Symbol.intern("FalseClass"), $FalseClass);
    this.#ctx.define(Symbol.intern("Numeric"), $Numeric);
    this.#ctx.define(Symbol.intern("String"), $String);
    this.#ctx.define(Symbol.intern("Symbol"), $Symbol);
    this.#ctx.define(Symbol.intern("Keyword"), $Keyword);
    this.#ctx.define(Symbol.intern("Array"), $Array);
    this.#ctx.define(Symbol.intern("Vector"), $Vector);
    this.#ctx.define(Symbol.intern("Hash"), $Hash);
    this.#ctx.define(Symbol.intern("Set"), $Set);
    this.#ctx.define(Symbol.intern("UnaryMessage"), $UnaryMessage);
    this.#ctx.define(Symbol.intern("BinaryMessage"), $BinaryMessage);
    this.#ctx.define(Symbol.intern("ArgListMessage"), $ArgListMessage);
    this.#ctx.define(Symbol.intern("KeywordMessage"), $KeywordMessage);
    this.#ctx.define(Symbol.intern("Dialog"), $Dialog);
    this.#ctx.define(Symbol.intern("Script"), $Script);
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

  eval(form: Form) {
    return this.analyze(form).dispatch(this.pool, this.#ctx);
  }

  analyze(form: Form) {
    return analyze(form);
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
