const Node = "node";
const Bun = "bun";
const Browser = "browser";
const PHP = "php";
const JavaScript = "javascript";

type Node = typeof Node;
type Bun = typeof Bun;
type Browser = typeof Browser;

type GenericJavaScript = typeof JavaScript;
type JavaScript = GenericJavaScript | Node | Bun | Browser;
type PHP = typeof PHP;

export type Platform = JavaScript | PHP;
export const Platform = {
    Node,
    Bun,
    PHP,
    Browser,
} as const;
Object.freeze(Platform);
