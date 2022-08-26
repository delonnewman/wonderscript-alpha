# WonderScript

A simple lisp for web development 

# Synopsis

    user> (+ 3 4)
    => 7
    user> (defn square (x) (* x x))
    => #js/function "function(x) { return (x*x); }"
    user> (square 5)
    => 25
    user> (reduce + (range 10))
    => 45

# Language

## Reader

- `true`, `false`, `nil`
- Numbers
- Symbols (string)
- Keywords (quoted string)
- Quoted Strings `"` delimited
- Arrays `(` delimited
- Quoted Arrays `[` delimited
- Maps `{` delimited

## Core Special Forms

- `def`
- `quote`
- `cond`
- `fn*` (a direct mapping of JS function semantics)
- `set!`
- `js*`
- `loop`
- `recur`
- `throw`
- `try`, `catch`, `finally` (not implemented)
- `new`
- `.`

## Operators
(treated specially by the compiler)

- `mod` [^1]
- `<`, `>`, `>=`, `<=` [^1]
- `not`
- `or`, `and`
- `bit-not`, `bit-or`, `bit-xor`, `bit-and`, `bit-right-shift`,
  `bit-left-shift`, `unsigned-bit-right-shift`
- ~~`identical?`~~ `==` (identity, i.e. object equality) [^1]
- `equiv?` (JS type coercive equality)
- `instance?` [^1]
- `type` [^1]
- `+`, `-`, `*`, `/` [^1]
- `aget`, `aset`, `alength`

[^1]: Paired with a function equivalent.

### Core Library

- `=` (value equality)
- `fn` (lambda macro with arity checks and arity polymorphism)
- `defn`
- `defmacro`
- `if`
- `+`, `-`, `*`, `/`, `mod`
- `<`, `>`, `>=`, `<=`
- `inc`, `dec` (+1, -1)?
- `identity`, `constantly`
- `comment`
- `even?`, `odd?`
- `zero?`, `pos?`, `neg?`
- `true?`, `false?`
- `map`, `reduce`, `filter`, `mapcat`
- `first`, `next`, `rest`, `second`, `cons`, `drop`, `take`
- `nth`, `concat`
- `range`
- `empty?`
- `partition`
- `when`, `unless`
- `dotimes`, `doeach`, `while`, `until`
- `pr`, `pr-str`
- `print`
- `str`
- `number?`, `string?`, `boolean?`, `function?` (rename to `fn?`?)
- `set?`, `map?`, `iterator?`, `get`
- `array-like?`, `array?`,  `->array`, `array`, `slice`,
  `push!`, `pop!`, `shift!`, `unshift!`
- `object?`, `undefined?`, `null?`, `nil?`
- `memoize`, `compose`, `apply`
- `maybe`?, `either`?, `raise`?
- `set-meta`, `meta`, `get-meta`, `reset-meta`
- `atom`, `reset!`, `swap!`, `deref`, `compare-and-swap!` (TODO)

# TODO

- [ ] Add test suite
- [ ] Remove Namespaces (use JS modules instead)
- [ ] Add syntax objects & syntax quoting
- [ ] Improve error reporting and stack traces
- [ ] Add generic functions
- [ ] Add protocols (implement protocols for existing objects/methods)
- [ ] Implement browser-based IDE
- [ ] Add abstractions for browser APIs
- [ ] Add a database interface
    - Datalog based by default
    - Abstract over SQL and KV stores
    - DBI-like interface for SQL stores
- [ ] Implement ST or CL-like images called a "world" (a reified notion of static and dynamic state)
    - [ ] Create new compilers based on "world" objects
    - [ ] Create encoders for world objects so they can be persisted and transmitted
- [ ] Update JS
    - [ ] Make use of `let` and `const`
    - [ ] Make use of `class`
    - [ ] Refactor into modules
    - [ ] Consider TypeScript?
  
# Author

Delon Newman <contact@delonnewman.name>
