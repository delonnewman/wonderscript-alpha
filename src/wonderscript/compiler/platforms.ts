const Node = "node";
const Bun = "bun";
const PHP = "php";
const Browser = "browser";

type Node = typeof Node;
type Bun = typeof Bun;
type PHP = typeof PHP;
type Browser = typeof Browser;

export type Platform = Node | Bun | Browser | PHP;
export const Platform = Object.freeze({
    Node,
    Bun,
    PHP,
    Browser,
}) as const;
