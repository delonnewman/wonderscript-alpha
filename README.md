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

## Special Forms

- `def`
- `quote`
- `cond`
- `fn*` (a direct mapping of JS function semantics)
- `set*` (a direct mapping of JS assignment semantics)
- `js*`
- `loop`
- `recur` - `repeat`?
- `throw`
- ~~`try`, `catch`, `finally`~~ (not implemented)
- `do` (a block with it's own environment), `begin` (an immediately executed block with no environment)
  - `rescue`, `ensure`, `else`
- `new`
- `.`

## Operators
(treated specially by the compiler)

Consider making is possible to define within WS, they would function as low-level code generating macros
that can also (optionally) be used as functions.

- `mod` [^1]
- `<`, `>`, `>=`, `<=` [^1]
- `not`
- `or`, `and`
- `bit-not`, `bit-or`, `bit-xor`, `bit-and`, `bit-right-shift`,
  `bit-left-shift`, `unsigned-bit-right-shift`
- ~~`identical?`~~ `==` (identity, i.e. object equality) [^1]
- `equiv?` (JS type coercive equality)
- `instance?` [^1]
- `typeof` [^1]
- `+`, `-`, `*`, `/` [^1]
- ~~`array-get`, `array-set!`, `array-length`~~
- `slot`, `slot-set!`, `slot?`, `length`

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

## Meta Object Protocol

- Invokable
- Function
- Method
- Class
- Protocol
- Record
- GenericFunction
- Definition
- Context
- Module
- Object

## Functions

`(fn (x) (+ 1 x))`, `#(+ 1 %)`

## Generic Functions

## Methods

Can be dispatched on any type and arbitrary Generic Functions

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

(defclass View ...)
```
## Definition Meta Data

- `:private` (only seen in module defaults to true)
- `:export` (definition can be exported)
- `:macro` (definition is a macro)
- `:doc` (doc string of the definition)
- `:typedef` (boolean, definition is a type alias)
- `:tag` (Symbol type tag of the def)
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
- Buffer < Object : Indexed
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
- ImmutableStack
  - pop()
  - peek()
  - push() 
- MutableStack
  - pop()
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
- `deftype`
- `defclass`
- `defprotocol`
- `defconst`
- `defvar`
- `set!`
- `raise`, (builds on throw, requires a class if no class is provided defaults to RuntimeError)
- `if`, `if-not`, `when`, `unless`
- `+`, `-`, `*`, `/`, `mod`
- `<`, `>`, `>=`, `<=`, `<=>`
- `inc`, `dec`
- `identity`, ~~`constantly`~~, `always`
- `comment`
- `even?`, `odd?`
- `zero?`, `pos?`, `neg?`
- `true?`, `false?`
- `reduce`, `map`, `filter`, `grep`, `mapcat`, `concat`, `reduce-right`,
- `first`, `next`, `rest`, `second`, `cons`, `drop`, `take`, `empty?`
- `each`, `tap`
- ~~`dotimes`, `doeach`~~, `for`, `while`, `until`
- ~~`nth`~~, `at`
- `range`
- `partition`
- ~~`pr`~~ `p`, ~~`pr-str`~~ `inspect`, `print`
- `str`
- `number?`, `string?`, `boolean?`, `function?`
- `set?`, `map?`, `iterator?`, `get`
- `array-like?`, `array?`,  `->array`, `array`, `slice`,
  `push!`, `pop!`, `shift!`, `unshift!`
- `object?`, `undefined?`, `null?`, `nil?`
- `memoize`, `compose`, `apply`
- `set-meta`, `meta`, `get-meta`, `reset-meta`
- `atom`, `reset!`, `swap!`, `deref`, `compare-and-swap!` (TODO)
- `freeze!`, `frozen?`, `clone`, `immutable?`, `mutable?`
- `deftest`, `is`

# defclass

```clojure
(defprotocol Invokable
  "The interface for all invokable objects"
  (invoke (*args)))
  
(defprotocol Type
  (satisfies (object)))

(defclass MethodSig
  (has      Symbol name)
  (has-many Symbol arglist)
  (has?     String doc))
  
(defclass Protocol :does Type
  (has-many? Protocol  ^:key protocols)
  (has-many  MethodSig ^:key signatures)
  (has?      String    ^:key doc))
  
(defclass Method :does Invokable
  (has      Symbol name)
  (has?     String doc)
  (has-many Symbol arglist)
  (has-many Form   body))
  
(defclass Property
  (has Symbol  name)
  (has Boolean required :default true))
  
(defclass Class :does Type
  (has?      String   doc)
  (has-many? Protocol protocols)
  (has-many  Property properties)
  (has-many  Method   methods))
```

Based on https://opendylan.org/documentation/intro-dylan/objects.html
```clojure
(defclass Vehicle
  (has serial-owner)
  (has owner))
  
(defclass Vehicle
  (has  Integer serial-number :key :sn)
  (has? String  owner
    :key :owner ;; true would work just as well here
    :default "Northern Motors"))
```

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
- [x] Update JS
    - [x] Make use of `let` and `const`
    - [x] Make use of `class`
    - [x] Refactor into modules
    - [x] TypeScript
  
# Author

Delon Newman <contact@delonnewman.name>
