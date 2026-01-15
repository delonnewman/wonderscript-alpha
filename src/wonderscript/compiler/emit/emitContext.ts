import { Context } from "../../lang/Context";
import { emitMap } from "./emitMap";

export function emitContext(context: Context): string {
    const top = new Context();
    const buffer = ["new wonderscript.lang.Context("];

    if (context.parent != null) {
        buffer.push(emitContext(context.parent));
    } else {
        buffer.push("undefined");
    }

    // Params
    buffer.push(", {");
    buffer.push(`source: ${context.getSource() ?? "undefined"}`);
    buffer.push(`, line: ${context.getLine() ?? "undefined"}`);
    buffer.push(`, recursive: ${context.isRecursive() ?? "false"}`);

    const vars = new Map();
    const names = context.getVarNames();
    for (const name of names) {
        vars.set(name, context.get(name));
    }
    if (vars.size) buffer.push(", vars: ", emitMap(vars, top));

    const varMeta = new Map();
    for (const name of names) {
        varMeta.set(name, context.getVarMeta(name));
    }
    if (varMeta.size) buffer.push(", varMeta: ", emitMap(varMeta, top));

    buffer.push("})");

    return buffer.join();
}
