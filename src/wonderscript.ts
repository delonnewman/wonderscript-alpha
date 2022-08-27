import {define} from "./wonderscript/compiler/Env";
import {CORE_MOD, CORE_NS, CURRENT_NS, TOP_LEVEL_ENV} from "./wonderscript/compiler/vars";
import {createNs} from "./wonderscript/lang/Namespace";
import {evalString, readString} from "./wonderscript/compiler";
import * as core from "./wonderscript/lang";
import * as compiler from "./wonderscript/compiler";
import {importModule, importSymbol} from "./wonderscript/lang";
import {RecursionPoint} from "./wonderscript/compiler/RecursionPoint";

export function initCompiler(global, platform) {
    const IS_NODE = platform === 'node';
    const IS_BROWSER = platform === 'browser';

    define(TOP_LEVEL_ENV, CORE_NS.name, CORE_NS);
    define(TOP_LEVEL_ENV, 'js', IS_NODE ? createNs('global', global) : createNs('window', global.window));

    if (IS_NODE) {
        // @ts-ignore
        const fs = require('fs');
        // @ts-ignore
        CORE_MOD.loadFile = function(f) {
            return evalString(fs.readFileSync(f, 'utf8'));
        };
        // @ts-ignore
        CORE_MOD.readFile = function(f) {
            return readString(fs.readFileSync(f, 'utf8'));
        };
    }

    importModule(core);
    importModule(compiler);

    // @ts-ignore
    CORE_MOD.NS = CURRENT_NS;
    importSymbol('*ns*', CURRENT_NS.value);
    importSymbol('$platform', platform);
    importSymbol(CORE_NS.name, CORE_NS);
    // @ts-ignore
    CORE_MOD.RecursionPoint = RecursionPoint;
}
