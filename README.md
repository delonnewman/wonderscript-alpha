# WonderScript

A simple lisp for web development 

# Synopsis

```lisp
user> (+ 3 4)
=> 7
user> (defn square (x) (* x x))
=> #js/function "function(x) { return (x*x); }"
user> (square 5)
=> 25
user> (reduce + (range 10))
=> 45
```

# Language

## Reader

- `true`, `false`, `nil`
- Numbers `1`, `100`, `1_000`, `1e10`, `1E10`'
- Rational? `1/2`
- Keyword `:keyword`
- String `"string"`
- Pair `left => right`? (Cons)
- List `(1 2 3 4)`
- Map `{:a => 1 :b => 2}` (immutable, eventually persistent)
- Vector `[1 2 3 4]` (immutable, eventually persistent)
- Set `#{1 2 3 4}` (immutable, eventually persistent)
- Function `#(+ %1 %2)`

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
- ~~`try`, `catch`, `finally`~~ (not implemented)
- ~~`do`~~
- `begin`, `rescue`, `ensure`, `else`?
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

## Equality

- `=`  value equality
- `==` object identity
- `=~` pattern match overloaded by different classes by implementing match(value)

## Types of Types

- Type Aliases `deftype`
- Union `(->or Number String)`, `(->and Number String)`
- Class `defclass`
  - Multiple inheritance (Look at PicoLisp, Dylan, CLOS), or no inheritance
    either way encourage composition via protocols, method / function composition.
- Protocol `defprotocol`
- Record `defrecord`

## Functions

, `(fn (x) (+ 1 x))`, `#(+ 1 %)`, `x => (+ 1 x)`? (if pairs workout)

## Generic Functions

## Methods

Can be added to any type and Generic Functions

## Modules

The broadest context for state.  With the macro forms `defconst` and `defvar` module level constants and dynamically
scoped variables can be defined.  By convention constants are spelled `$contstant`, and variables are spelled
`*variable*`.  Constants and variable can be accessed globally when scoped with the module name i.e. `$Module::constant`
or `*Module::variable*`.  By convention modules names are camel cased.  All other definitions with in a module must be
explicitly exported and imported to be used.  Keywords that are prefixed with a `::` like `::keyword` are automatically
expanded into `:Module::keyword`.  Modules can be nested inner modules can be accessed with the same notation as other
definitions i.e. `OuterModule::InnerModule`.  Definitions specified with `def` and relatives, `defn`, `defmacro`,
`defclass`, `deftype`, `defprotocol`, `defrecord` are namespaced by their module and private unless exported.
Definitions can be exported with the `module` form, and imports can be specified with the `use` form.  `use` with or
without imports makes the modules and all shared definitions accessible (scoped by the module name).

```lisp
(module Dragnet
  (export View TemplateView PageView Button Link))
  
(use Web
  (import html css js))
```

Exports and shared symbols can also be specified with meta data on the symbol:

```lisp
(module Web)

(defn ^:export html
   (form) ...)

(module Dragnet)

(defclass ^:shared View ...)
```
## Definition Meta Data

- `:private` (only seen in module defaults to true)
- `:shared` (can be accessed namespaced by the module)
- `:export` (definition can be exported)
- `:macro` (definition is a macro)
- `:doc` (doc string of the definition)
- `:type` (boolean, definition is a type alias)
- `:sig` (the type signature of a function)

## Data Structures

### Protocols

- Null
- Numeric
- Boolean
- Meta
- Reference
- Associative - Associate one value with another, lookup values in constant time
- Indexed < Associative - numerically associative
- Named
- Sequence
- Sequencible

### Classes

- Value
- Object : Reference
- Nil < Value : Null
- Unset? < Value : Null (state of an unset key in an Associative data structure)
- Undefined? < Value : Null (state of an undefined symbol)
- NaN < Value : Null (state of an undefined numerical operation)
- True < Value
- False < Value
- Symbol < Value : Named, Meta
- Keyword < Value : Named
- Pair < Value : Sequence
- List < Value : Sequence, Meta
- LazyList < Value : Sequence
- Range < Value : Sequence
- Map < Value : Associative
- Dictionary < Object : Associative
- Set < Value : Associative
- MutableSet < Object : Associative
- String < Value : Indexed
- CharBuffer < Object : Indexed
- Vector < Value : Indexed
- Array < Object : Indexed
- Function < Value

## Protocols

A collection of properties/shapes and doc strings

- Meta
  - meta()
  - set-meta(key, value)
  - get-meta(key)
- Value
  - hash-code()
- Named?
  - name()
  - namespace()
- Collection
  - add(col, value)
- Seq < Collection
  - first()
  - next()
- Sequenceable < Collection
  - seq()
- Associative < Sequenceable
  - get(key, alt = nil)
  - remove(key)
- Indexed < Associative
  - at(index)
- Stack
  - pop()
  - peek()
  - push()
- Queue
- Matchable =~
  - match(pattern)
- Equality =
  - equal(other)
- Comparable <=>
  - cmp(other)
- js/ArrayLike
  - length:number

### Core Library

- `=` (value equality)
- `=~` (matching)
- `fn` (lambda macro with arity checks and arity polymorphism)
- `defn`
- `defmacro`
- `if`
- `+`, `-`, `*`, `/`, `mod`
- `<`, `>`, `>=`, `<=`, `<=>`
- `inc`, `dec` (+1, -1)?
- `identity`, ~~`constantly`~~, `always`
- `comment`
- `even?`, `odd?`
- `zero?`, `pos?`, `neg?`
- `true?`, `false?`
- `reduce`, `map`, `filter`, `grep`, `mapcat`, `concat`, `reduce-right`, `each`
- `first`, `next`, `rest`, `second`, `cons`, `drop`, `take`, `empty?`
- ~~`nth`~~, `at`
- `range`
- `partition`
- `when`, `unless`
- `dotimes`, `doeach`, `while`, `until`
- `pr`, `pr-str`, `print`
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
- `freeze!`, `unfreeze!`, `clone`
- `assert`

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
