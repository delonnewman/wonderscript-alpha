import {Env} from "./wonderscript/compiler/Env";
import {CORE_NS, CURRENT_NS} from "./wonderscript/compiler/vars";
import {createNs} from "./wonderscript/lang/Namespace";
import * as core from "./wonderscript/lang";
import * as compiler from "./wonderscript/compiler";
import {importModule, importSymbol, Keyword} from "./wonderscript/lang";
import {Form} from "./wonderscript/compiler/core";
import {findDefinitionMetaData} from "./wonderscript/compiler/findDefinitionMetaData";
import {Symbol} from "./wonderscript/lang";
import {RecursionPoint} from "./wonderscript/compiler/RecursionPoint";

type Platform = "node" | "browser"

export class Compiler {
    private readonly env: Env;
    private readonly global: object;
    readonly platform: Platform

    constructor(platform: Platform, global: object) {
        this.env = new Env();
        this.global = global
        this.platform = platform
        this.init()
    }

    private init() {
        this.env.define(CORE_NS.name, CORE_NS);

        if (this.isNode()) {
            this.env.define('js', createNs('global', this.global));
        } else {
            // @ts-ignore
            this.env.define('js', createNs('window', this.global.window));
        }

        importModule(core);
        importModule({
            loadFile: this.loadFile.bind(this),
            readFile: this.readFile.bind(this),
            eval: this.eval.bind(this),
            evalString: this.evalString.bind(this),
            compile: this.compile.bind(this),
            compileString: this.compileString.bind(this),
            macroexpand: this.macroexpand.bind(this),
            readString: compiler.readString,
            prStr: compiler.prStr,
            theMeta: (sym: Symbol) => findDefinitionMetaData(sym, this.env),
            RecursionPoint: RecursionPoint
        });

        importSymbol(CORE_NS.name, CORE_NS);
        importSymbol('*ns*', CURRENT_NS.value);
        importSymbol('$is-browser', this.isBrowser());
        importSymbol('$is-node', this.isNode());
        importSymbol('$platform-info', this.platformInfo());
    }

    platformInfo(): Map<Keyword, any> {
        const info = new Map();

        return info;
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
        return compiler.evaluate(form, this.env);
    }

    compile(form: Form): string {
        return compiler.compile(form, this.env);
    }

    evalString(s: string, src = 'inline') {
        return compiler.evalString(s, this.env, src);
    }

    compileString(s: string): string {
        return compiler.compileString(s, this.env);
    }

    macroexpand(form: Form): Form {
        return compiler.macroexpand(form, this.env);
    }

    prStr(form: Form): string {
        return compiler.prStr(form);
    }
}