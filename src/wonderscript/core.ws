; -*- mode: clojure -*-

(def array (fn* (&args) args))

(def array?
  (fn* (val)
    (send js/Array (isArray val))))

(def string?
  (fn* (val)
    (identical? "string" (typeof val))))

(def symbol?
  (fn* (val)
    (instance? val wonderscript.lang/Symbol)))

(def keyword?
  (fn* (val)
    (instance? val wonderscript.lang/Keyword)))

(def vector?
  (fn* (val)
    (instance? val wonderscript.lang/Vector)))

(def vector
  (fn* (&xs) (new wonderscript.lang/Vector xs)))

(def list?
  (fn* (val)
    (instance? val wonderscript.lang/List)))

(def boolean?
  (fn* (val)
    (identical? "boolean" (typeof val))))

(def number?
  (fn* (val)
    (identical? "number" (typeof val))))

(def integer?
  (fn* (val)
    (and
     (identical? (typeof val) "number")
     (identical? val (send js/Math (round val))))))

(def undefined?
  (fn* (val)
    (identical? "undefined" (typeof val))))

(def object?
  (fn* (val)
    (and
     (not (nil? val))
     (identical? "object" (typeof val)))))

(def function?
  (fn* (val)
    (identical? "function" (typeof val))))

(def map?
  (fn* (val)
    (instance? val js/Map)))

(def set?
  (fn* (val)
    (instance? val js/Set)))

(def gensym
  (let (^:mutable i 0)
    (fn* (template)
      (set* i (+ i 1))
      (send wonderscript.lang/Symbol (intern (str (or template "sym") i))))))

(def message-sender
  (fn* (slot)
   (fn* (obj)
    (if (and obj (slot? obj slot))
      (send obj slot)))))

(def name (message-sender "name"))
(def namespace (message-sender "namespace"))

(def ^:macro comment (fn* (&xs) nil))

(def ^:macro cond
  (fn*
   (&clauses)
   (if (and clauses (not-identical? 0 (slot-get clauses :length)))
     (array 'if (first clauses)
        (if (next clauses)
          (first (rest clauses))
          (throw (new js/Error "cond requires an even number of forms")))
        (cons 'cond (next (next clauses)))))))

(def assoc-array?
  (fn* (a)
   (if (not (array? a))
     false
     (array? (a 0)))))

(def splat?
  (fn* (sym)
    (if (symbol? sym)
      (send (send sym :name) (startsWith "&"))
      false)))

(def parsed-args
  (fn* (arglist)
    (send arglist
     (map
      (fn* (sym i)
        (if (splat? sym)
          {:name
           (send
            wonderscript.lang/Symbol
            (intern (send (send sym :name) (slice 1))))
           :order i
           :splat true}
          {:name sym
           :order i
           :splat false}))))))

; TODO: need gensym for "args" variable
(def arity-validation-forms
  (fn* (parsed argsym)
    (let (nargs (length parsed))
      (if (send parsed (some #(:splat %)))
        (array '> (array 'length argsym) (- nargs 1))
        (array 'identical? nargs (array 'length argsym))))))

(def let-bindings-form
  (fn* (pair argsym)
    (cons 'let
      (cons
       (send (pair 0)
        (flatMap (fn* (x i)
         (if (splat? x)
           (array (send wonderscript.lang/Symbol (intern (send (name  x) (slice 1))))
            (array 'send argsym (array 'slice i)))
           (array x (array 'array-get argsym i))))))
       (send pair (slice 1))))))

(def ^:macro fn
  (fn* (&xs)
   (let (x (xs 0))
     (cond
       (assoc-array? x) ;; multiple arities
       (let (arglists (map first xs)
             parsed (map parsed-args arglists)
             arities (send (map #(length %) arglists) (sort #(cond (< %1 %2) -1 (> %1 %2) 1 :else 0)))
             splat (send parsed (some (fn* (list) (send list (some #(:splat %))))))
             arity-str (if splat (str (arities 0) " or more") (send arities (join " or ")))
             argsym (gensym "args"))
         (array 'fn*
                (array (send wonderscript.lang/Symbol (intern (str "&" argsym))))
                (cons 'cond
                      (send
                       (send xs
                             (flatMap
                              (fn* (x i)
                                   (array (arity-validation-forms (parsed i) argsym)
                                          (let-bindings-form x argsym)))))
                       (concat
                        (array :else
                               (array 'throw
                                      (array 'new 'js/Error
                                             (array 'str "wrong number of arguments (given "
                                                    (array 'length argsym) ", expected " arity-str ")")))))))))
       :else
         (let (parsed (parsed-args x)
               arity (length x)
               splat (send parsed (some #(:splat %)))
               arity-str (if splat (str arity " or more") (str arity))
               argsym (gensym "args"))
           (array 'fn* (array (send wonderscript.lang/Symbol (intern (str "&" argsym))))
                  (array 'if (arity-validation-forms (parsed-args x) argsym)
                         (let-bindings-form xs argsym)
                         (array 'throw
                                (array 'new 'js/Error
                                       (array 'str "wrong number of arguments (given "
                                              (array 'length argsym) ", expected " arity-str ") "))))))))))

(def ^:macro defn
  (fn
    (name &rest)
    (let (doc  (cond (string? (rest 0)) (rest 0))
          meta (cond (map? (rest 0)) (rest 0) (map? (rest 1)) (rest 1))
          args (cond
                 (array? (rest 0)) (rest 0)
                 (array? (rest 1)) (rest 1)
                 (array? (rest 2)) (rest 2)
                 :else (throw (new js/Error "an arglist is required")))
          body (cond
                 (and doc meta) (send rest (slice 3))
                 (or doc meta) (send rest (slice 2))
                 :else (send rest (slice 1)))
          nm (send name (withMeta (merge meta {:doc doc}))))
     (array 'def nm (cons 'fn (cons args body))))))

(defn ^:macro defmacro
  (name &rest)
  (let (nm (send name (withMeta {:macro true})))
    `(defn ~nm ~@rest)))

(defn macro?
  (sym) (:macro (the-meta sym)))

(defmacro deftype
  "Define a type alias"
  {:added 1.0}
  (name type-val)
  (let (nm (send name (withMeta {:typedef true})))
    `(def ~nm ~type-val)))

(defmacro typedef?
  (sym)
  (:typedef (the-meta sym)))

(defn js-primitive-type?
  (obj) (not-identical? "object" (typeof obj)))

(defn js-primitive-number?
  (val) (identical? "number" (typeof val)))

(deftype Any       'any)
(deftype Undefined 'undefined)
(deftype Null      'null)
(deftype Number    'number)
(deftype String    'string)
(deftype Boolean   'boolean)
(deftype Object    'object)
(deftype Array     array?)
(deftype Nil       nil?)

;; Keyword & Symbol

(defn keyword
  ((name)
   (cond
     (keyword? name) name
     (symbol? name) (send wonderscript.lang/Keyword (intern (send name :name) (send name :namespace)))
     (string? name) (send wonderscript.lang/Keyword (intern name))))
  ((ns name) (send wonderscript.lang/Keyword (intern name ns))))

(defn symbol
  ((name)
   (cond
     (symbol? name) name
     (keyword? name) (send wonderscript.lang/Symbol (intern (send name :name) (send name :namespace)))
     (string? name) (send wonderscript.lang/Symbol (intern name))))
  ((ns name) (send wonderscript.lang/Symbol (intern name ns))))

(defn ==
  (a b)
  (identical? a b))

(defn identity (x) x)

(defn always
  (x) (fn () x))

;; Boolean & Logic

(defmacro if-not
  ((pred then)
   `(if-not ~pred ~then nil))
  ((pred then other)
   `(if (not ~pred) ~then ~other)))

(defmacro when (pred &acts)
  `(cond ~pred (begin ~@acts)))

(defmacro unless (pred &acts)
  `(cond (not ~pred) (begin ~@acts)))

(defn true?
  (x) (or (identical? true x) (identical? true (send x :valueOf))))

(defn false?
  (x) (or (identical? false x) (identical? false (send x :valueOf))))

(defn falsy?
  (obj) (or (nil? obj) (false? obj)))

(defn truthy?
  (obj) (not (falsy? obj)))

;; Basic functions and OOP

(def apply
  (fn (f args)
    (send f (invoke args))))

(def call
  (fn (f &args)
    (send f (invoke args))))

(defn freeze!
  (object) (send js/Object (freeze object)))

(defn frozen?
  (object) (send js/Object (isFrozen object)))

(defn immutable?
  (value) (or (js-primitive-type? value) (frozen? value)))

(defn mutable?
  (value) (not (immutable? value)))

(defmacro defconst
  "Define a constant value this means the definition
  cannot change and the value must be immutable"
  ((name value)
   `(defconst ~name nil ~value))
  ((name doc value)
   (let (nm (send name (withMeta {:doc doc :constant true})))
     `(def ~nm
        (if (immutable? ~value)
          ~value
          (throw (new js/Error "only immutable values can be constants")))))))

(defmacro defvar
  "Define a dynamically scoped variable. It will retain it's global
  value but can be rebound with the `local` form."
  ((name) (array 'defvar name nil nil))
  ((name value)
   `(defvar ~name nil ~value))
  ((name doc value)
   (let (nm (send name (withMeta {:doc doc :dynamic true})))
     `(def ~nm ~value))))

(defmacro var
  ((name) `(var ~name nil))
  ((name value)
   (let (nm (send name (withMeta {:mutable true})))
     (send *ctx* (define nm value))
     value)))

(defmacro this-context
  () *ctx*)

(defmacro defonce
  ((name value)
   (if-not (defined? name)
     `(def ~name ~value))))

(defn clone
  (object)
  (if (send js/Array (isArray object))
    (send object (slice 0))
    (send js/Object (assign (send js/Object (create nil)) object))))

(defn js-object-tag
  (object)
  (send (slot-get (slot-get js/Object :prototype) :toString) (call object)))

(defn js-prototype
  (object)
  (send js/Object (getPrototypeOf object)))

(defn js-constructor
  (object)
  (slot-get (js-prototype object) :constructor))

(defn js-constructor-name
  (object)
  (slot-get (js-constructor object) :name))

(defn type
  (value)
  (if (identical? "object" (typeof value))
    (js-constructor value)
    (symbol (typeof value))))

(defn same-type?
  (a b)
  (send (type a) (equals (type b))))

(defn constructor?
  (obj)
  (and
   (function? obj)
   (send js/Object (hasOwn obj "prototype"))))

(def class? constructor?)

(defn isa?
  (t value)
  (if (function? t)
    (instance? value t)
    (let (vt (type value))
      (if (and (send 'object (equals t)) (class? vt))
        true
        (send vt (equals t))))))

(defn make-class
  (() (make-class (fn* ()) nil))
  ((ctr) (make-class ctr nil))
  ((ctr superclass)
   (slot-set! ctr :prototype
    (send js/Object (create superclass)))
   ctr))

(defn add-method
  (klass name f)
  (slot-set! (slot-get klass :prototype) name f))

(defmacro defclass
  ((name) `(defclass ~name nil))
  ((name superclass)
   (let (nm (send name (withMeta {:typedef true})))
     `(def ~nm (make-class ~superclass)))))

;; Numerical

;; numerical constants
(defconst PI      (slot-get js/Math :PI))
(defconst E       (slot-get js/Math :E))
(defconst LOG10E  (slot-get js/Math :LOG10e))
(defconst LOG2E   (slot-get js/Math :LOG2e))
(defconst LN10    (slot-get js/Math :LN10))
(defconst LN2     (slot-get js/Math :LN2))
(defconst SQRT1-2 (slot-get js/Math :SQRT1_2))
(defconst SQRT2   (slot-get js/Math :SQRT2))

(defn ->integer
  (s) (js/parseInt s 10))

(defn ->float
  (s) (js/parseFloat s))

(defn bigint?
  (n) (identical? "bigint" (typeof n)))

(defn inc (x) (+ x 1))
(defn dec (x) (- x 1))

(defmacro <var-op>
  (operator identity)
  (let (args (gensym "args")
        arglist (array (symbol (str "&" (send args :name)))))
    `(fn* ~arglist
        (cond
          (identical? 0 (slot-get ~args :length))
          (if-not (nil? ~identity)
            ~identity
            (new js/Error "wrong number of arguments (expected at least 1 got 0)"))
          (identical? 1 (slot-get ~args :length))
          (if (send ~operator (equals '-))
            (* -1 (array-get ~args 0))
            (array-get ~args 0))
          :else
          (js*
           "(function(){"
           "let x = " (if-not (nil? ~identity) ~identity) ";"
           "for (let i = 0; i < " (str ~args) ".length; i++) {"
           "if (x == null) { x = " (str ~args) "[i] }"
           "else { x = x " (str ~operator) " " (str ~args) "[i] } } return x; }())")))))

(def + (<var-op> + 0))
(def - (<var-op> - nil))
(def * (<var-op> * 1))
(def / (<var-op> / nil))

(defn **
  (n m) (send js/Math (pow n m)))

(defn sum
  "Take the sum of the values in the collection"
  (col) (reduce + col 0))

(defn product
  "Take the product of the values in the collection"
  (col) (reduce * col 1))

(defn zero?
  (x) (identical? 0 x))

(defn nonzero?
  (x) (not-identical? 0 x))

(defn positive?
  (x) (< 0 x))

(defn negative?
  (x) (> 0 x))

(defn finite?
  (x) (js/isFinite x))

(defn infinite?
  (x) (not (finite? x)))

(defn NaN?
  (x) (js/isNaN x))

(defn even? (x)
  (identical? (bit-and x 1) 0))

(defn odd? (x)
  (identical? (bit-and x 1) 1))

(defn rand
  (n)
  (if n
    (send js/Math (floor (* n (send js/Math :random))))
    (send js/Math :random)))

(defn floor
  (n) (send js/Math (floor n)))

(defn ceil
  (n) (send js/Math (ceil n)))

(defn round
  ((n) (send js/Math (round n)))
  ((n factor) (* factor (send js/Math (round (/ n factor))))))

;; Basic Array, Strings & ArrayLike

(defconst EMPTY-ARRAY (freeze! (array)))

(defn concat
  (&arrays)
  (send (slot-get js/Array :prototype :concat) (apply EMPTY-ARRAY arrays)))

(defn prepend
  (col x)
  (if (slot? col :prepend)
    (send col (prepend x))
    (throw (new js/Error "unknown method prepend"))))

(defn append
  (col x)
  (if (slot? col :append)
    (send col (append x))
    (throw (new js/Error "unknown method append"))))

(defn make-array
  (() (new js/Array))
  ((n) (new js/Array n)))

;; TODO: will need to extend for seqs
(defn ->array
  (obj)
  (send js/Array (from obj)))

(defn array-like?
  (obj)
  (and (identical? "object" (typeof obj))
       (number? (slot-get obj :length))))

(defn slice
  ((col start)
   (send col (slice start)))
  ((col start end)
   (send col (slice start end))))

(defn at
  (col n)
  (if (< n 0)
    (send col (at (+ (length col) n)))
    (send col (at n))))

(defn push!
  (array value)
  (send (slot-get js/Array :prototype :push) (call array value)))

(defn pop!
  (array)
  (send (slot-get js/Array :prototype :pop) (call array)))

(defn unshift!
  (array value)
  (send (slot-get js/Array :prototype :unshift) (call array value)))

(defn shift!
  (array)
  (send (slot-get js/Array :prototype :shift) (call array)))

(defn <=>
  (a b)
  (cond
    (< a b) -1
    (> a b) 1
    (slot? a "cmp") (send a (cmp b))
    (slot? b "cmp") (send b (cmp a))
    :else 0))

(defn sort!
  (array)
  (send (slot-get js/Array :prototype :sort) (call array <=>)))

(defn sort
  (array)
  (sort! (clone array)))

(defn fill!
  ((array value)
   (send array (fill value)))
  ((array value start)
   (send array (fill value start)))
  ((array value start end)
   (send array (fill value start end))))

(defn reverse!
  (array)
  (unless (array? array)
    (throw (new js/Error (str "no automatic conversion of " (type array) " to array"))))
  (send (slot-get js/Array :prototype :reverse) (call array)))

(defn reverse
  (col)
  (if (array? col)
    (reverse! (clone col))
    (reverse! (->array col))))

(defn index-of
  (array value)
  (send (slot-get js/Array :prototype :indexOf) (call array value)))

(defn length
  (array) (slot-get array :length))

;; Strings

(defvar $white-space-regex (freeze! (new js/RegExp "\\s+")))
(defconst EMPTY-STRING "")

(defn blank?
  (object)
  (or (nil? object) (zero? (length object))
      (and (string? object)
           (identical? 0 (slot-get (send object (replace $white-space-regex EMPTY-STRING)) :length)))))

(defn present?
  (object)
  (not (blank? object)))

(defn presence
  (object)
  (if (blank? object)
    nil
    object))

(defn trim
  (s) (send s :trim))

(defn trim-leading
  (s) (send s :trimStart))

(defn trim-trailing
  (s) (send s :trimEnd))

(defn starts-with?
  (s ch)
  (if (or (keyword? s) (symbol? s))
    (send (name s) (startsWith ch))
    (send s (startsWith ch))))

(defn ends-with?
  (s ch)
  (if (or (keyword? s) (symbol? s))
    (send (name s) (endsWith ch))
    (send s (endsWith ch))))

(defvar $ending-new-line-pattern (freeze! (new js/RegExp "(\\n|\\r\\n)$")))
(defvar $new-line-pattern (freeze! (new js/RegExp "\\r\\n|\\n")))

(defn chomp
  (s) (send s (replace $ending-new-line-pattern EMPTY-STRING)))

(defn lines
  (s) (send s (replace $new-line-pattern)))

(defn chop
  (s) (send s (slice 0 (- (length s) 1))))

(defn chr
  (ch)
  (if (number? ch)
    (send js/String (fromCodePoint ch))
    (send js/String (fromCodePoint (->integer ch)))))

(defn chrs
  (array)
  (send (send array (map #(chr %))) (join EMPTY-STRING)))

(defn upcase
  (s) (send s :toUpperCase))

(defn downcase
  (s) (send s :toLowerCase))

(defn capitalize
  (s)
  (str
   (send (send s (at 0)) :toUpperCase)
   (send s (slice 1 (slot-get s :length)))))

(defn words
  (s) (send s (split $white-space-regex)))

(defn titlecase
  ; FIXME: without the intermediary #() this throws mysterious error
  (s) (send (send (words s) (map #(capitalize %))) (join " ")))

(defn mapcat
  (f coll)
  (apply concat (map f coll)))

;; Imperative Programming

(defmacro set!
  ((sym value)
   `(set* ~sym ~value))
  ((obj key value)
   `(cond
     (array-like? ~obj) (array-set! ~obj ~key ~value)
     (respond-to? ~obj :set) (send ~obj (set ~key ~value))
     (object? ~obj) (slot-set! ~obj ~key ~value)
     :else (throw (new js/Error "can only set keys for associative values")))))

(defmacro for-times
  (bindings &body)
  (let (nm   (bindings 0)
        init (bindings 1))
    `(loop (~nm 0)
       (when (< ~nm ~init)
         ~@body
         (recur (+ ~nm 1)))
       ~init)))

;; TODO: generalize with seq interface
(defmacro for-each
  (bindings &body)
  (let (nm  (bindings 0)
        col (bindings 1)
        i   (gensym "i")
        xs  (gensym "xs"))
    `(let (~xs ~col)
       (loop (~nm (~xs 0)
              ~i 0)
         (when (not (nil? ~nm))
           ~@body
           (recur (~xs (+ 1 ~i)) (+ 1 ~i)))
         ~xs))))

(defmacro while
  (pred &body)
  `(loop ()
    (when ~pred ~@body (recur))))

(defmacro until
  (pred &body)
  `(loop ()
    (unless ~pred ~@body (recur))))

(defn times
  (n f)
  (let (a (make-array))
    (for-times (i n)
      (push! a (f i)))
    a))

(defn each
  (a f) (send a (forEach f)) a)

(defn tap
  (val f) (f val) val)

(defn print
  (x) (send js/console (log x)))

(defn say
  (&args)
  (apply
   (slot-get js/console :log)
   (send (send args (map pr-str)) (join ""))))

(defn p
  (x) (print (pr-str x)))

;; Assertions and Testing

(defmacro is
  ((exp)
   `(is ~exp (str "Failed assertion: " (pr-str ~exp " is false"))))
  ((exp msg)
   `(begin (cond (not ~exp) (throw ~msg)) ~exp)))

(defmacro is-not (body &args)
  (cons 'is (cons (array 'not body) args)))

(defmacro deftest
  (name &body)
  (let (nm (send name (withMeta {:test true})))
    (array 'def nm (cons 'fn (cons '() body)))))

;; OOP & JS reflection

(defn js-define-slot-value
  (obj slot-name value)
  (array-set! obj slot-name value))

(defn js-define-prototype-value
  (object slot-name value)
  (array-set! (js-prototype object) slot-name value))

(defn seal!
  (object) (send js/Object (seal object)))

(defn sealed?
  (object) (send js/Object (isSealed object)))

(defn extensible?
  (object) (send js/Object (isExtensible object)))

(defn prevent-extensions!
  (object) (send js/Object (preventExtensions object)))

; TODO: support compiler generated functions
(defn arity
  (f)
  (if (function? f)
    (slot-get f :length)
    (throw (new js/Error "arity cannot be found"))))

(defn js-object
  (() (send js/Object (create nil)))
  ((&kvs)
   (if (odd? (length kvs))
     (throw (new js/Error "key/value pairs should be even"))
     (send js/Object (fromEntries (partition 2 kvs))))))

(defn js-property-value
  (obj property-name)
  (array-get obj property-name))

;; Return the bound method or throw an exception
(defn method
  (obj method-name)
  (let (val (js-property-value obj method-name))
    (if (function? val)
      (send val (bind obj))
      (throw (new js/Error "undefined method")))))

(defmacro respond-to?
  (obj msg)
  (if (or (symbol? msg) (keyword? msg) (string? msg))
    `(function? (slot-get ~obj ~msg))
    ;; TODO: implement
    false))

(defn bind
  (f object)
  (send (slot-get js/Function :prototype :bind) (call f object)))

(defn partial
  (f &args)
  (send
   (slot-get js/Function :prototype :bind)
   (apply f (send (array nil) (concat args)))))

;; More advanced array functions

(defn partition (n a)
  (let (pairs (array))
    (for-times (i (send js/Math (floor (/ (length a) n))))
      (let (p (array))
        (for-times (j n)
          (array-set! p j (array-get a (+ (* n i) j))))
        (array-set! pairs i p)))
    pairs))

(defn range
  ((stop) (range 0 stop 1))
  ((start stop) (range start stop 1))
  ((start stop step)
   (let (a (array)
         ^:mutable i 0)
     (while (< i stop)
       (push! a i)
       (set! i (+ i step)))
     a)))

;; see Math.min
(defn min
  (numbers)
  (array-get (sort numbers) 0))

;; see Math.max
(defn max
  (numbers)
  (array-get (sort numbers) (- (length numbers) 1)))

(defn indices
  (indexed)
  (let (a (make-array))
    (for-times (i (slot-get indexed :length))
      (push! a i))
    a))

(defn repeat
  (s n)
  (let (a (make-array))
    (for-times (i n)
      (push! a s))
    (send a (join ""))))

;; Maps & Sets

(defn hash-map
  (() (new js/Map))
  ((&kvs)
   (when (odd? (length kvs))
     (throw (new js/Error "key/value pairs should be even")))
   (new js/Map (partition 2 kvs))))

(defn set
  (col)
  (new js/Set (->array col)))

(defn merge!
  "Merge two or more maps into the first map. The first map will change in
   place. When one map is given return it."
  ((x) x)
  ((x y)
   (let (entries (send y :entries))
     (send
      entries
      (forEach
       (fn* (pair)
         (send x (set (pair 0) (pair 1))))))
     x))
  ((x y &zs)
   (merge! x y)
   (send
    zs
    (forEach
     (fn* (m)
       (merge! x m))))
   x))

;; These are polymorphic on Maps ans Sets and any other
;; object that implements the method.
(defn keys
  (map) (->array (send map :keys)))

(defn values
  (map) (->array (send map :values)))

(defn entries
  (map) (->array (send map :entries)))

(defn size
  (map) (slot-get map :size))

;; These are map specific
(defn add-key!
  (map key value)
  (send map (set key value)))

(defn key?
  (map key)
  (send (slot-get js/Map :prototype :has) (call map key)))

;; These are set specific
(defn add-member!
  (set member)
  (send (slot-get js/Set :prototype :add) (call set member)))

(defn member?
  (set member)
  (send (slot-get js/Set :prototype :has) (call set member)))

;; Seq & Seqable

(defn seq?
  (obj)
  (or (nil? obj) (array? obj) (map? obj) (set? obj)
      (and (slot? obj "first") (slot? obj "next"))))

(defn seqable?
  (obj)
  (or (seq? obj) (slot? obj "seq")))

(defn seq
  (obj)
  (cond
    (nil? obj) EMPTY-ARRAY
    (seq? obj) obj
    (seqable? obj) (send obj :seq)
    :else
      (throw "value is not a seq or seqable")))

(defn second
  (xs) (first (rest xs)))

(defn third
  (xs) (first (rest (rest xs))))

(defn fourth
  (xs) (first (rest (rest (rest xs)))))

;; TODO: perhaps rename these to include! and include, which might pair nicely with includes?
(defn add!
  (col value)
  (cond
    (array-like? col) (begin (push! col value) col)
    (map? col) (add-key! col (at value 0) (at value 1))
    (set? col) (add-member! col value)
    (slot? col :add) (send col (add value))
    :else
      (throw "don't know how to add a value to this collection")))

(defn add
  (col value)
  (add! (clone col) value))

(defn remove!
  (col ref)
  (cond
    (array? col) (begin (send col (splice ref 1)) col)
    (slot? col :delete) (begin (send col (delete ref)) col)
    :else
      (throw "don't know how to remove a value from this collection")))

(defn remove
  (col ref)
  (remove! (clone col) ref))

(defn clear!
  (col)
  (cond
    (array? col) (send col (splice 0))
    (slot? col :clear) (begin (send col :clear) col)
    :else
      (throw (str "cannot clear" (pr-str col)))))

;; TODO: add alias key as meta data
(defmacro alias
  (name old)
  (array 'def name (array 'clone old)))

(def empty! clear!)

(defn empty
  (col)
  (cond
    (array-like? col) EMPTY-ARRAY
    (respond-to? col :empty) (send col :empty)
    :else
      (empty! (clone col))))

(defn count
  (col)
  (cond
    (array-like? col) (length col)
    (or (map? col) (set? col)) (size col)
    (slot? col :count) (send col :count)
    :else
     (reduce (fn (n _) (inc n)) col 0)))

(defn includes?
  (col value)
  (cond
    (array-like? col) (not-identical? -1 (index-of col value))
    (map? col) (key? col value)
    (set? col) (member? col value)
    (respond-to? col :includes) (send col (includes value))
    :else
      (throw "can't test inclusion")))

(defn all?
  ((col)
   (all? col truthy?))
  ((col f)
   (reduce
    (fn (bool x) (and bool (f x))) col true)))

(defn =
  (a b)
  (cond
    ;; null and undefined are equal
    (and (nil? a) (nil? b)) (equiv? a b)
    ;; (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality)
    (and (js-primitive-number? a) (js-primitive-number? b))
       (or (identical? a b) (and (not-identical? a a) (not-identical? b b)))
    (respond-to? a :equals) (send a (equals b))
    (respond-to? b :equals) (send b (equals a))
    :else
      (identical? (hash-code a) (hash-code b))))

(def === isa?)

(defmacro case-with
  (pred value &conditions)
  (cons 'cond
         (send (partition 2 conditions)
               (flatMap
                (fn* (x)
                 (if (send :else (equals (x 0)))
                   x
                   (array (array pred (x 0) value) (x 1))))))))

(defmacro case
  (value &conditions)
  (cons 'case-with (cons '=== (cons value conditions))))

;; HTML Rendering

(defn tag?
  (x) (and (vector? x) (keyword? (x 0))))

(defn has-attr?
  (x) (map? (x 1)))

(defn component?
  (x) (and (vector? x) (function? (x 0))))

(def tag-list? vector?)

(def event-attrs
  {:on-abort "onabort"
   :on-autocomplete "onautocomplete"
   :on-autocomplete-error "onautocompleteerror"
   :on-blur "onblur"
   :on-cancel "oncancel"
   :on-canplay "oncanplay"
   :on-canplay-through "canplaythrough"
   :on-change "change"
   :on-click "click"
   :on-close "close"
   :on-context-menu "contextmenu"
   :on-cue-change "cuechange"
   :on-dblclick "dblclick"
   :on-drag "drag"
   :on-drag-end "dragend"
   :on-drag-enter "dragenter"
   :on-drag-leave "dragleave"
   :on-drag-over "dragover"
   :on-drag-start "dragstart"
   :on-drop "drop"
   :on-duration-change "durationchange"
   :on-emptied "emptied"
   :on-ended "ended"
   :on-error "error"
   :on-focus "focus"
   :on-input "input"
   :on-invalid "invalid"
   :on-key-down "keydown"
   :on-key-press "keypress"
   :on-key-up "keyup"
   :on-load "load"
   :on-loaded-data "loadeddata"
   :on-loaded-metadata "loadedmetadata"
   :on-load-start "loadstart"
   :on-mouse-down "mousedown"
   :on-mouse-enter "mouseenter"
   :on-mouse-leave "mouseleave"
   :on-mouse-move "mousemove"
   :on-mouse-out "mouseout"
   :on-mouse-over "mouseover"
   :on-mouse-up "mouseup"
   :on-mouse-wheel "mousewheel"
   :on-pause "pause"
   :on-play "play"
   :on-playing "playing"
   :on-progress "progress"
   :on-rate-change "ratechange"
   :on-reset "reset"
   :on-resize "resize"
   :on-scroll "scroll"
   :on-seeked "seeked"
   :on-seeking "seeking"
   :on-select "select"
   :on-show "show"
   :on-sort "sort"
   :on-stalled "stalled"
   :on-submit "submit"
   :on-suspend "suspend"
   :on-time-update "timeupdate"
   :on-toggle "toggle"
   :on-volume-change "volumechange"
   :on-waiting "waiting"})

(let (^:mutable current-id 0)
  (defn render-attr
    (attr value handlers)
    (let (event (event-attrs attr))
      (set* current-id (+ 1 current-id))
      (if (and event value)
        (begin
         (push! handlers [(str "element-" current-id) event value])
         (str "id=\"element-" current-id "\""))
        (str (name attr) "=\"" value "\"")))))

(defn render-attrs
  (form handlers)
  (reduce #(str %1 " " %2)
          (map #(render-attr (% 0) (% 1) handlers) (entries form))))

(def render-form) ; render-tag-list and html are mutually recursive

(defn render-tag-list
  (form handlers)
  (send (map #(render-form % handlers) form) (join "")))

(defn render-attr-tag
  (form handlers)
  (let (tag  (form 0)
        nm   (name tag)
        attr (render-attrs (form 1) handlers))
    (str "<" nm " " attr ">" (render-tag-list (slice form 2) handlers) "</" nm ">")))

(defn render-tag
  (form handlers)
  (let (t  (form 0)
        nm (name t))
    (str "<" nm ">" (render-tag-list (slice form 1) handlers) "</" nm ">")))

(defn render-component
  (form handlers)
  (let (comp  (form 0)
        attrs (form 1))
    (render-form (comp attrs) handlers)))

(defn render-form
  (form handlers)
  (cond
    (nil? form) EMPTY-STRING
    (or (boolean? form) (number? form))
      (str form)
    (string? form) form
    (tag? form)
      (if (has-attr? form)
        (render-attr-tag form handlers)
        (render-tag form handlers))
    (component? form) (render-component form handlers)
    (tag-list? form) (render-tag-list form handlers)
    :else
      (throw (new js/Error (str "unknown form: " (pr-str form))))))

(defn render-event-handler
  (handler)
  (let (id (handler 0)
        event (handler 1)
        cb (handler 2))
    (str "document.getElementById(" (send js/JSON (stringify id)) ").addEventListener("
         (send js/JSON (stringify event)) ", " (compile (array 'fn* (array) cb)) ")")))

(defn render-event-handlers
  (handlers)
  (str "<script>"
       (send (map #(render-event-handler %) handlers) (join ";")) "</script>"))

(defn html
  (form)
  (let (event-handlers (make-array)
        content (render-form form event-handlers))
    (if-not (empty? event-handlers)
      (str content (render-event-handlers event-handlers))
      content)))

(defn button
  (() (button {:label "Button"}))
  ((attrs)
   (let (label   (:label attrs)
         onclick (:on-click attrs))
     [:button {:on-click onclick} label])))
