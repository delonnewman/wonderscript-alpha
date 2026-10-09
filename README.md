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
- ~~`cond`~~
- ~~`fn*` (a direct mapping of JS function semantics)~~
- `set*` (a direct mapping of JS assignment semantics)
- `js*`
- `loop`
- `recur` - `repeat`? or maybe `again`
- `throw`
- ~~`try`, `catch`, `finally`~~ (not implemented)
- `do` (a block with it's own environment), `begin` (an immediately executed block with no environment)
  - `rescue`, `ensure`, `else`
- ~~`new`~~
- ~~`.`~~
- `send` (message passing)

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
- `slot-get`, `slot-set!`, `slot?`, `length`

[^1]: Paired with a function equivalent.

## Equality

- `=` value equality
- `==` object identity
- `=~` pattern match overloaded by different classes by implementing match(value)

## Types of Types

- Type Aliases `deftype`
- Union `(or Number String)`, `(and Number String)`
- Class `defclass`
  - Multiple inheritance (Look at PicoLisp, Dylan, CLOS), or no inheritance
    either way encourage composition via protocols, method / function composition.
- Protocol `defprotocol`
- Record `defrecord`

## Meta Object Protocol

- Callable
- Procedure : Callable
- Method : Callable
- Class
- Protocol
- Record
- GenericFunction : Callable
- Definition
- Context
- Module
- Object

## Functions

`(fn (x) (+ 1 x))`, `#(+ 1 %)`

## Generic Functions

## Methods

Can be dispatched on any type and arbitrary Generic Functions

## Packages

The broadest context for state. With the macro forms `const` and `var` package level constants and dynamically
scoped variables can be defined. By convention constants are spelled `$constant`, and variables are spelled
`*variable*`. Constants and variables are accessed globally when scoped with the package name i.e. `$Package::constant`
or `*Package::variable*`. By convention package names are camel cased. ~~All other definitions with in a package must be
explicitly exported and imported to be used.~~ Keywords that are prefixed with a `::` like `::keyword` are automatically
expanded into `:Package::keyword`. ~~Packages can be nested. Inner modules can be accessed with the same notation as other
definitions i.e. `OuterModule::InnerModule`.~~ Definitions specified with `def` and relatives, `defn`, `defmacro`,
`defclass`, `deftype`, `defprotocol`, `defrecord` are namespaced by their package and public unless exported flagged as private.
Without the private flag both a global and lexical name will be created with the private flag only a lexical name will be created.
~~Definitions can be exported with the `module` form, and imports can be specified with the `use` form.~~ `use` with or
without imports makes the package definitions accessible scoped by the package name.

```lisp
(package Dragnet
  (export View TemplateView PageView Button Link))

(use Web
  (import html css js))
```

Exports and shared symbols can also be specified with meta data on the symbol:

```clojure
(package Web)

(defn html
   (form) ...)

(package Dragnet)

(class View ...)
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
- `array-like?`, `array?`, `->array`, `array`, `slice`,
  `push!`, `pop!`, `shift!`, `unshift!`
- `object?`, `undefined?`, `null?`, `nil?`
- `memoize`, `compose`, `apply`
- `set-meta`, `meta`, `get-meta`, `reset-meta`
- `atom`, `reset!`, `swap!`, `deref`, `compare-and-swap!` (TODO)
- `freeze!`, `frozen?`, `clone`, `immutable?`, `mutable?`
- `deftest`, `is`

# defclass

```clojure
(protocol Invokable
  "The interface for all invokable objects"
  (invoke (*args)))

(protocol Type
  (satisfies (object)))

(class MethodSig
  (has      Symbol name)
  (has-many Symbol arglist)
  (has?     String doc))

(class Protocol :does Type
  (has-many? Protocol  ^:key protocols)
  (has-many  MethodSig ^:key signatures)
  (has?      String    ^:key doc))

(class Method :does Invokable
  (has      Symbol name)
  (has?     String doc)
  (has-many Symbol arglist)
  (has-many Form   body))

(class Property
  (has Symbol  name)
  (has Boolean required :default true))

(class Class :does Type
  (has?      String   doc)
  (has-many? Protocol protocols)
  (has-many  Property properties)
  (has-many  Method   methods))
```

Based on https://opendylan.org/documentation/intro-dylan/objects.html

```clojure
(class Vehicle
  (has serial-owner)
  (has owner))

(class Vehicle
  (has  Integer serial-number :key :sn)
  (has? String  owner
    :key :owner ;; true would work just as well here
    :default "Northern Motors"))
```

# Message Passing

``` clojure
;; Unary Operators
(true not) ;; true is sent the message 'not

;; Binary Operators
(1 + 2) ;; 1 is sent the message '(+ 2)

;; ArgList
(js/console log "Hi" "There!")

;; Keyword Args
(Personnel new :name "Jean Luc Picard" :rank (Rank captain))

;; Data
(class Personnel
  (has ^:key name)
  (has ^:key rank)

  ((->Str) name)

  ((<=> ^Personnel other)
    (rank <=> (other rank)))

  ("Hi" "How do you do?"))

(def person (Personnel new :name "Geordi La Forge" :rank (Rank lt)))
(person "Hi") ;; => "How do you do?"

;; Singleton objects
;; singleton objects are equivalent to lambda expressions
(def greet (object ((quote (name)) "Hello " ~ name ~ "!"))
;; or
(object greet
  ('(name) "Hello " ~ name ~ "!"))

(greet "Data") ;; => "Hello Data!"

(macroexpand '(fn (x) x)) ;; => (object ((quote (x)) x))
(macroexpand '(fn ((x) x) ((x y) [x y])) ;; => (object ((quote (x)) x) ((quote (x y)) [x y]))

(object Message
  ((build msg) (wonderscript.core/Message build msg))
  ((send obj msg) ((self build msg) sendTo obj)))
  
(Message build '(name)) ;; => #<Message ...>
(Message send greet '("Guinan")) ;; => "Hello Guinan!"

;; Singleton objects also have equivalence with case statements
(def x 1)
(let a-case (Object new))
(def a-case 1 "one")
(def a-case 2 "two")
(def a-case 3 "three")
(def a-case (dont-know ...) "Don't know")
(a-case x) ;; => "one"

(case x
  (1 "one")
  (2 "two")
  (3 "three")
  :else
    "Don't know") ;; => "one"

(def 'if '(predicate consequent) (predicate and consequent))
(def 'if '(predicate consequent alternate) ((predicate and consequent) or alternate))

(if true "Hi" "Bye") ;; => "Hi"

;; 'self' is the current script object
(def 'fn '(name args *body)
  (do
    (let obj (Object new))
    (obj define args body)
    ((self bindings) define name obj)
    name))

(def 'fn '(args *body) ('fn (gensym "fn") args body))

(fn ident (x) x) ;; => 'ident
(fn (x) (x + 1)) ;; => 'fn-38
```

# Author

Delon Newman <contact@delonnewman.name>
