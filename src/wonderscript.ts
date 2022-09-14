import {Context, MUTABLE_KW} from "./wonderscript/lang/Context";
import {CORE_NS, CURRENT_NS} from "./wonderscript/compiler/vars";
import {createNs} from "./wonderscript/lang/Namespace";
import * as core from "./wonderscript/lang";
import * as compiler from "./wonderscript/compiler";
import {importModule, importSymbol, Keyword} from "./wonderscript/lang";
import {Form} from "./wonderscript/compiler/core";
import {findDefinitionMetaData} from "./wonderscript/compiler/findDefinitionMetaData";
import {Symbol} from "./wonderscript/lang";
import {RecursionPoint} from "./wonderscript/compiler/RecursionPoint";
import {escapeChars} from "./wonderscript/compiler/utils";
import {Definition, DYNAMIC_KW} from "./wonderscript/lang/Definition";
import {Module} from "./wonderscript/lang/Module";
import {findNamespaceVar} from "./wonderscript/compiler/findNamespaceVar";

export * from "./wonderscript/lang";

type Platform = "node" | "browser"

export const JS_SYM = Symbol.intern("js");
export const CURRENT_MOD_SYM = Symbol.intern("*module*", null, new Map([[DYNAMIC_KW, true]]));

export class Compiler {
    private readonly ctx: Context;
    private readonly global: object;
    readonly platform: Platform;
    readonly coreMod: Module;

    constructor(platform: Platform, global: object) {
        this.global = global;
        this.platform = platform;
        this.ctx = new Context();
        this.coreMod = new Module(
            Symbol.intern("wonderscript.core"),
            Context.withinModule(this.ctx)
        );
        this.init()
    }

    private init() {
        this.ctx.define(this.coreMod.name, this.coreMod);
        this.ctx.define(CURRENT_MOD_SYM, this.coreMod);
        this.coreMod.importModule(core);

        if (this.isNode()) {
            this.ctx.define(JS_SYM, new Module(JS_SYM).importAlienModule(this.global));
        } else {
            // @ts-ignore
            this.ctx.define(JS_SYM, new Module(JS_SYM).importAlienModule(this.global.window));
        }

        this.coreMod.importModule({
            loadFile: this.loadFile.bind(this),
            readFile: this.readFile.bind(this),
            eval: this.eval.bind(this),
            evalString: this.evalString.bind(this),
            compile: this.compile.bind(this),
            compileString: this.compileString.bind(this),
            macroexpand: this.macroexpand.bind(this),
            readString: compiler.readString,
            prStr: compiler.prStr,
            theMeta: (sym: Symbol) => findDefinitionMetaData(sym, this.ctx),
            isDefined: (sym: Symbol) => findNamespaceVar(sym, this.ctx) != null,
            RecursionPoint,
            escapeChars,
        });

        this.coreMod.importSymbol('$is-browser', this.isBrowser());
        this.coreMod.importSymbol('$is-node', this.isNode());
        this.coreMod.importSymbol('$platform-info', this.platformInfo());
    }

    platformInfo(): Map<Keyword, any> {
        const info = new Map();

        return Object.freeze(info);
    }

    private isNode(): boolean {
        return this.platform === 'node';
    }

    private isBrowser(): boolean {
        return this.platform === 'browser';
    }

    loadFile(path: string): Compiler {
        if (this.isNode()) {
            this.evalString(this.slurp(path), path);
        }

        if (this.isBrowser()) {
            this.fetchFile(path)
                .then((text) => this.evalString(text, path))
        }

        return this;
    }

    readFile(path: string) {
        if (this.isNode()) {
            return compiler.readString(this.slurp(path));
        }

        if (this.isBrowser()) {
            return this.fetchFile(path)
                .then((text) => compiler.readString(text))
        }
    }

    // node only
    private slurp(path: string): string {
        // @ts-ignore
        const fs = require('fs');
        return fs.readFileSync(path, 'utf8');
    }

    private fetchFile(path: string): Promise<string> {
        return fetch(path)
            .then((res) => res.text())
    }

    eval(form: Form) {
        return compiler.evaluate(form, this.ctx);
    }

    compile(form: Form): string {
        return compiler.compile(form, this.ctx);
    }

    evalString(s: string, src = 'inline') {
        return compiler.evalString(s, this.ctx, src);
    }

    compileString(s: string): string {
        return compiler.compileString(s, this.ctx);
    }

    macroexpand(form: Form): Form {
        return compiler.macroexpand(form, this.ctx);
    }

    prStr(form: Form): string {
        return compiler.prStr(form);
    }
}