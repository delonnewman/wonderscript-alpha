import { readString } from "./reader";
import { Class } from "./lang/Class";
import { ObjectPool, ObjectValue } from "./lang/ObjectPool";
import { analyze } from "./analyze";
import { Context } from "./lang/Context";
import { Symbol } from "./lang/Symbol";
import { UnaryMessage } from "./lang/Message/UnaryMessage";
import { Dialog } from "./lang/Dispatch/Dialog";

export class Interpreter {
  #pool: ObjectPool;
  #ctx: Context = new Context();

  constructor() {
    const Object = new Class("Object");
    Object.defineMethod(
      new UnaryMessage("class"),
      {
        dispatch(pool: ObjectPool, ctx: Context): unknown {
          const self = ctx.get('self');
          if (self == null) {
            throw new Error(`expected 'self' in context ${ctx}`);
          }

          return pool.class(self as ObjectValue);
        },
      }
    );
    Object.defineMethod(new UnaryMessage("allocate"), {
      dispatch(pool: ObjectPool, ctx: Context): unknown {
        const self = ctx.get("self");
        if (self == null) {
          throw new Error(`expected 'self' in context ${ctx}`);
        }

        const klass = new Dialog(
          self as ObjectValue,
          new UnaryMessage("class")
        ).dispatch(pool, ctx);

        return pool.allocate(klass as Class);
      },
    });

    const ClassClass = Object.subclass(Symbol.intern('Class'));

    const NilClass = Object.subclass(Symbol.intern('NilClass'));
    NilClass.defineMethod(new UnaryMessage("inspect"), {
      dispatch(_pool: ObjectPool, _ctx: Context): unknown {
        return "nil";
      },
    });

    const TrueClass = Object.subclass(Symbol.intern('TrueClass'));
    const FalseClass = Object.subclass(Symbol.intern('FalseClass'));
    const Numeric = Object.subclass(Symbol.intern('Numeric'));
    const String = Object.subclass(Symbol.intern('String'));

    const foundation = {
      null: NilClass,
      undefined: NilClass,
      true: TrueClass,
      false: FalseClass,
      number: Numeric,
      string: String,
      Numeric,
      String,
      FalseClass,
      TrueClass,
      NilClass,
    };

    this.#pool = new ObjectPool(foundation);
  }

  get pool() { return this.#pool }

  readString(input: string) {
    return readString(input);
  }

  analyzeString(input: string) {
    const forms = this.readString(input);
    return forms.map(analyze);
  }

  evalString(input: string, ctx = this.#ctx) {
    const forms = this.analyzeString(input);
    let result;
    forms.forEach(f => {
      result = f.dispatch(this.pool, ctx);
    });
    return result;
  }
}
