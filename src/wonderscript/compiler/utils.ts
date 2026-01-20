import { isString } from "../js";

const names = {
  "=": "eq",
  "not=": "noteq",
  "<": "lt",
  ">": "gt",
  "<=": "lteq",
  ">=": "gteq",
  "+": "add",
  "-": "sub",
  "*": "mult",
  "/": "div",
} as const;

export function capitalize(x: string): string {
  if (x.length === 0) return x;
  return `${x[0].toUpperCase()}${x.slice(1)}`;
}

const DASH = "-";
const UNDERSCORE = "_";

export function dasherize(string: string): string {
  const buffer = [];

  for (let i = 0; i < string.length; i++) {
    let ch = string[i];
    if (ch.match(/[A-Z]/)) {
      // TODO: replace this with a numerical method
      buffer.push(DASH);
      buffer.push(ch.toLowerCase());
    } else if (ch === UNDERSCORE) {
      buffer.push(DASH);
    } else {
      buffer.push(ch);
    }
  }

  return buffer.join("");
}

export function wsNameToJS(x: string): string {
  if (names[x]) {
    return names[x];
  }

  var prefix = null,
    parts;

  if (x.endsWith("?")) {
    prefix = "is";
    x = x.slice(0, x.length - 1);
  } else if (x.endsWith("!")) {
    x = x.slice(0, x.length - 1);
  } else if (x.startsWith("*") && x.endsWith("*")) {
    return x
      .slice(0, x.length - 1)
      .slice(1)
      .split("-")
      .map((s) => s.toUpperCase())
      .join("_");
  }

  if (x.indexOf("->") !== -1) {
    parts = x.split("->").reduce((a, x) => `${a} to ${x}`);
  } else {
    parts = prefix ? [].concat(prefix, x.split("-")) : x.split("-");
  }

  return [].concat(parts[0], parts.slice(1).map(capitalize)).join("");
}

const SPECIAL_CHARS = {
  "=": "_EQ_",
  "\\-": "_DASH_",
  "\\*": "_STAR_",
  "!": "_BANG_",
  "\\?": "_QUEST_",
  "\\^": "_HAT_",
  "\\+": "_PLUS_",
  "\\.": "_DOT_",
  "/": "_BSLASH_",
  "\\\\": "_FSLASH_",
  ">": "_GT_",
  "<": "_LT_",
  "\\[": "_OBRACK_",
  "\\]": "_CBRACK_",
  "\\$": "_DOLLAR_",
  "\\@": "_AT_",
  "\\%": "_PERCENT_",
  "~": "_TILDE_",
} as const;

export function isInternable(val: string): boolean {
  return /^[a-zA-Z_$]+[a-zA-Z0-9_$]*$/.test(val);
}

export function escapeChars(str: string): string {
  if (!isString(str))
    throw new Error("only strings can be escaped not " + JSON.stringify(str));

  if (isInternable(str)) return str;

  for (let ch in SPECIAL_CHARS) {
    str = str.replace(new RegExp(ch, "g"), SPECIAL_CHARS[ch]);
  }

  return str;
}

const CORE_NAMES = {
  eq: "=",
  noteq: "not=",
  lt: "<",
  gt: ">",
  lteq: "<=",
  gteq: ">=",
  add: "+",
  sub: "-",
  mult: "*",
  div: "/",
};

export function importSymbol(
  module: Record<string, unknown>,
  name: string,
  obj: unknown
) {
  let wsName = CORE_NAMES[name];

  if (name[0] === name[0].toUpperCase()) {
    // Don't escape names that start with uppercase
    wsName = name;
  } else if (wsName) {
    wsName = escapeChars(dasherize(wsName));
  } else if (name.startsWith("is")) {
    wsName = `${name.slice(2).toLowerCase()}?`;
    wsName = escapeChars(dasherize(wsName));
  } else {
    wsName = escapeChars(dasherize(name));
  }

  module[wsName] = obj;
}

export function importModule(
  target: Record<string, unknown>,
  source: Record<string, unknown>
) {
  Object.keys(source).forEach((name) => {
    importSymbol(target, name, source[name]);
  });
}
