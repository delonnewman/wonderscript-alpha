; -*- mode: clojure -*-

(def array (fn* (&args) args))

(def ^:macro comment (fn* (&xs) nil))

(def assoc-array?
  (fn*
   (a)
   (cond
     (not (.isArray js/Array a))
       false
     :else
       (.isArray js/Array (a 0)))))

(def splat?
  (fn* (sym)
       (cond (symbol? sym)
             (.startsWith (.name sym) "&")
             :else false)))

(def parsed-args
  (fn* (arglist)
       (.map arglist
             (fn* (sym i)
                  (cond
                    (splat? sym)
                      {:name (symbol (.slice (.name sym) 1)) :order i :splat true}
                    :else
                      {:name sym :order i :splat false})))))

; TODO: need gensym for "args" variable
(def arity-validation-forms
  (fn* (parsed argsym)
       (let (nargs (array-length parsed))
         (cond
           (.some parsed #(:splat %))
             (array '> (array 'array-length argsym) (- nargs 1))
           :else
             (array 'identical? nargs (array 'array-length argsym))))))

(def let-bindings-form
  (fn* (pair argsym)
       (cons 'let
             (cons
              (.flatMap (pair 0)
                        (fn* (x i)
                             (cond
                               (splat? x)
                                 (array (symbol (.slice (.name x) 1))
                                        (array '.slice argsym i))
                               :else
                                 (array x (array argsym i)))))
              (.slice pair 1)))))

(def ^:macro fn
  (fn*
   (&xs)
   (let (x (xs 0))
     (cond
       (assoc-array? x)
       (let (arglists (map first xs)
             parsed (map parsed-args arglists)
             arities (.sort (map #(array-length %) arglists) #(cond (< %1 %2) -1 (> %1 %2) 1 :else 0))
             splat (.some parsed (fn* (list) (.some list #(:splat %))))
             arity-str (cond splat (str (arities 0) " or more") :else (.join arities " or "))
             argsym (gensym "args"))
         (array 'fn*
                (array (symbol (str "&" argsym)))
                (cons 'cond
                      (.concat
                       (.flatMap xs
                                 (fn* (x i)
                                      (array (arity-validation-forms (parsed i) argsym)
                                             (let-bindings-form x argsym))))
                       (array :else
                              (array 'throw
                                     (array 'js/Error.
                                            (array 'str "wrong number of arguments (given "
                                                   (array 'array-length argsym) ", expected " arity-str ")"))))))))
       :else
         (let (parsed (parsed-args x)
               arity (array-length x)
               splat (.some parsed #(:splat %))
               arity-str (cond splat (str arity " or more") :else (str arity))
               argsym (gensym "args"))
           (array 'fn* (array (symbol (str "&" argsym)))
                  (array 'cond (arity-validation-forms (parsed-args x) argsym)
                         (let-bindings-form xs argsym)
                         :else
                         (array 'throw
                                (array 'js/Error.
                                       (array 'str "wrong number of arguments (given "
                                              (array 'array-length argsym) ", expected " arity-str ")"))))))))))

(def ^:macro defn
  (fn
    (name &rest)
    (let (doc  (cond (string? (rest 0)) (rest 0))
          meta (cond (map? (rest 0)) (rest 0) (map? (rest 1)) (rest 1))
          args (cond
                 (array? (rest 0)) (rest 0)
                 (array? (rest 1)) (rest 1)
                 (array? (rest 2)) (rest 2)
                 :else (throw (js/Error. "an arglist is required")))
          body (cond
                 (and doc meta) (.slice rest 3)
                 (or doc meta) (.slice rest 2)
                 :else (.slice rest 1))
          nm (.withMeta name (merge meta {:doc doc})))
     (array 'def nm (cons 'fn (cons args body))))))

(defn ^:macro defmacro
  (name &rest)
  (let (nm (.withMeta name {:macro true}))
    (cons 'defn (cons nm rest))))

(defn macro?
  (sym) (:macro (the-meta sym)))

(defmacro deftype
  "Define a type alias"
  {:added 1.0}
  (name type-val)
  (let (nm (.withMeta name {:typedef true}))
    (array 'def nm type-val)))

(defn type?
  (sym) (:typedef (the-meta sym)))

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

(defn ==
  (a b)
  (identical? a b))

(defn identity (x) x)

(defn always
  (x) (fn () x))

;; Boolean & Logic

(defmacro if
  ((pred then)
   (array 'cond pred then))
  ((pred then other)
   (array 'cond pred then :else other)))

(defmacro if-not
  ((pred then)
   (array 'if-not pred then nil))
  ((pred then other)
   (array 'cond (array 'not pred) then :else other)))

(defmacro when (pred &acts)
  (array 'cond pred (cons 'begin acts)))

(defmacro unless (pred &acts)
  (array 'cond (array 'not pred) (cons 'begin acts)))

(defn true?
  (x) (identical? true x))

(defn false?
  (x) (identical? false x))

(defn falsy?
  (obj) (and (identical? obj false) (nil? obj)))

(defn truthy?
  (obj) (not (falsy? obj)))

;; Basic functions and OOP

(def apply
  (fn (f args)
    (.invoke f args)))

(def call
  (fn (f &args)
    (.invoke f args)))

(defn freeze!
  (object) (.freeze js/Object object))

(defn frozen?
  (object) (.isFrozen js/Object object))

(defn immutable?
  (value) (or (js-primitive-type? value) (frozen? value)))

(defn mutable?
  (value) (not (immutable? value)))

(defmacro defconst
  "Define a constant value this means the definition
  cannot change and the value must be immutable"
  ((name value)
   (array 'defconst name nil value))
  ((name doc value)
   (let (nm (.withMeta name {:doc doc :constant true}))
     (array 'def nm
            (array 'if (array 'immutable? value)
                   value
                   (array 'throw (array 'js/Error. "only immutable values can be constants")))))))

(defmacro defvar
  ((name) (array 'defvar name nil nil))
  ((name value)
   (array 'defvar name nil value))
  ((name doc value)
   (let (nm (.withMeta name {:doc doc :dynamic true}))
     (array 'def nm value))))

(defmacro var
  ((name) (array 'var name nil))
  ((name value)
   (let (nm (.withMeta name {:mutable true}))
     (.define %context nm value)
     value)))

(defmacro this-context
  () %context)

(defmacro defonce
  ((name value)
   (if-not (defined? name)
     (array 'def name value))))

(defn clone
  (object)
  (if (.isArray js/Array object)
    (.slice object 0)
    (.assign js/Object (.create js/Object nil) object)))

(defn js-object-tag
  (object)
  (.call (.-toString (.-prototype js/Object)) object))

(defn js-prototype
  (object)
  (.getPrototypeOf js/Object object))

(defn js-constructor
  (object)
  (.-constructor (js-prototype object)))

(defn js-constructor-name
  (object)
  (.-name (js-constructor object)))

(defn type
  (value)
  (if (identical? "object" (typeof value))
    (symbol (js-constructor-name value))
    (symbol (typeof value))))

(defn same-type?
  (a b)
  (.equals (type a) (type b)))

(defn constructor?
  (obj) (and (function? obj) (.hasOwn obj "prototype")))

(def class? constructor?)

(defn isa?
  (t value)
  (if (function? t)
    (instance? value t)
    (.equals (type value) t)))

(def Object nil)

(defmacro make-class
  (() (make-class (fn* ()) Object))
  ((ctr) (make-class ctr Object))
  ((ctr superclass)
   (array 'slot-set! ctr 'prototype
          (array '.create 'js/Object superclass))
   ctr))

(defn define-method
  (klass name f)
  (slot-set! (.-prototype klass) name f))

(defmacro defclass
  ((name) (array 'defclass name nil))
  ((name superclass)
   (let (nm (.withMeta name {:typedef true}))
     (array 'def nm (array 'make-class superclass)))))

;; Numerical

;; numerical constants
(defconst $pi      (.-PI js/Math))
(defconst $e       (.-E js/Math))
(defconst $log10e  (.-LOG10e js/Math))
(defconst $log2e   (.-LOG2e js/Math))
(defconst $ln10    (.-LN10 js/Math))
(defconst $ln2     (.-LN2 js/Math))
(defconst $sqrt1-2 (.-SQRT1_2 js/Math))
(defconst $sqrt2   (.-SQRT2 js/Math))

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
  (let (args (gensym "args"))
    (array 'fn*
           (array (symbol (str "&" (.name args))))
           (array 'cond
                  (array 'identical? 0 (array '.-length args))
                  (if-not (nil? identity)
                    identity
                    (array 'js/Error. "wrong number of arguments expected at least 1 got 0"))
                  (array 'identical? 1 (array '.-length args))
                  (if (.equals operator '-)
                    (array '* -1 (array 'array-get args 0))
                    (array 'array-get args 0))
                  :else
                  (array 'js*
                         "let x = " (array 'if identity identity) ";"
                         "for (let i = 0; i < " (str args) ".length; i++) {"
                         "if (x == null) { x = " (str args) "[i] }"
                         "else { x = x " (str operator) " " (str args) "[i] } } return x;")))))

(def + (<var-op> + 0))
(def - (<var-op> - nil))
(def * (<var-op> * 1))
(def / (<var-op> / nil))

(defn **
  (n m) (.pow js/Math n m))

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
    (.floor js/Math (* n (.random js/Math)))
    (.random js/Math)))

(defn floor
  (n) (.floor js/Math n))

(defn ceil
  (n) (.ceil js/Math n))

(defn round
  ((n) (.round js/Math n))
  ((n factor) (* factor (.round js/Math (/ n factor)))))

;; Basic Array, Strings & ArrayLike

(defconst $empty-array (freeze! []))

(defn concat
  (&arrays)
  (.apply (.-concat (.-prototype js/Array)) $empty-array arrays))

(defn array?
  (object)
  (.isArray js/Array object))

(defn make-array
  (() (js/Array.))
  ((n) (js/Array. n)))

;; TODO: will need to extend for seqs
(defn ->array
  (object)
  (.from js/Array object))

(defn array-like?
  (object)
  (and (identical? "object" (typeof object))
       (number? (.-length object))))

(defn slice
  ((col start)
   (.slice col start))
  ((col start end)
   (.slice col start end)))

; TODO: add support for seqs
(defn at
  (col n) (.at col n))

(defn push!
  (array value)
  (.call (.-push (.-prototype js/Array)) array value))

(defn pop!
  (array)
  (.call (.-pop (.-prototype js/Array)) array))

(defn unshift!
  (array value)
  (.call (.-unshift (.-prototype js/Array)) array value))

(defn shift!
  (array)
  (.call (.-shift (.-prototype js/Array)) array))

(defn <=>
  (a b)
  (cond
    (< a b) -1
    (> a b) 1
    (slot? a "cmp") (.cmp a b)
    (slot? b "cmp") (.cmp b a)
    :else 0))

(defn sort!
  (array)
  (.call (.-sort (.-prototype js/Array)) array <=>))

(defn sort
  (array)
  (sort! (clone array)))

(defn fill!
  ((array value)
   (.fill array value))
  ((array value start)
   (.fill array value start))
  ((array value start end)
   (.fill array value start end)))

(defn reverse!
  (array)
  (unless (array? array)
    (throw (js/Error. (str "no automatic conversion of " (type array) " to array"))))
  (.call (.-reverse (.-prototype js/Array)) array))

(defn reverse
  (col)
  (if (array? col)
    (reverse! (clone col))
    (reverse! (->array col))))

(defn index-of
  (array value)
  (.call (.-indexOf (.-prototype js/Array)) array value))

(defn array-length
  (array) (.-length array))

;; Strings

(defconst $white-space-regex (freeze! (js/RegExp. "\\s+")))
(defconst $empty-string "")

(defn blank?
  (object)
  (or (nil? object) (zero? (array-length object))
      (and (string? object)
           (identical? 0 (.-length (.replace object $white-space-regex $empty-string))))))

(defn present?
  (object)
  (not (blank? object)))

(defn presence
  (object)
  (if (blank? object)
    nil
    object))

(defn trim
  (s) (.trim s))

(defn trim-leading
  (s) (.trimStart s))

(defn trim-trailing
  (s) (.trimEnd s))

(defn name
  (named)
  (when (slot? named "name")
    (.name named)))

(defn namespace
  (named)
  (when (slot? named "namespace")
    (.namespace named)))

(defn starts-with?
  (s ch)
  (if (or (keyword? s) (symbol? s))
    (.startsWith (name s))
    (.startsWith s ch)))

(defn ends-with?
  (s ch)
  (if (or (keyword? s) (symbol? s))
    (.startsWith (name s))
    (.endsWith s ch)))

(defconst $ending-new-line-pattern (freeze! (js/RegExp. "(\\n|\\r\\n)$")))
(defconst $new-line-pattern (freeze! (js/RegExp. "\\r\\n|\\n")))

(defn chomp
  (s) (.replace s $ending-new-line-pattern $empty-string))

(defn lines
  (s) (.split s $new-line-pattern))

(defn chop
  (s) (.slice s 0 (- (array-length s) 1)))

(defn chr
  (ch)
  (if (number? ch)
    (.fromCodePoint js/String ch)
    (.fromCodePoint js/String (->integer ch))))

(defn chrs
  (array)
  (.join (.map array chr) $empty-string))

(defn upcase
  (s) (.toUpperCase s))

(defn downcase
  (s) (.toLowerCase s))

(defn capitalize
  (s) (str (.toUpperCase (.at s 0)) (.slice s 1 (.-length s))))

(defn words
  (s) (.split s $white-space-regex))

(defn titlecase
  (s) (.join (.map (words s) capitalize) " "))

(defn mapcat
  (f coll)
  (apply concat (map f coll)))

;; Imperative Programming

(defmacro set!
  ((sym value)
   (array 'set* sym value))
  ((obj key value)
   (array 'cond
     (array 'array? obj) (array 'array-set! obj key value)
     (array 'has-method? obj 'set) (array '.set obj key value)
     (array 'object? obj) (array 'slot-set! obj key value)
     :else (array 'throw (array 'js/Error. "can only set keys for associative values")))))

;; TODO: include let binding for macro output for better performance, will need gensym
(defmacro for-times
  (bindings &body)
  (let (nm   (bindings 0)
        init (bindings 1))
    (array 'loop (array nm 0)
          (cons 'when
                (cons (array '< nm init)
                      (concat body (array (array 'recur (array '+ nm 1))))))
          init)))

(defmacro for-each
  (bindings &body)
  (let (nm  (bindings 0)
        col (bindings 1))
    (array 'loop (array nm (array 'col 0) 'i 0)
           (cons 'when
                 (cons (array 'not (array 'nil? nm))
                       (concat body (array (array 'recur (array 'col (array 'inc 'i)) (array 'inc 'i))))))
           col)))

(defmacro while
  (pred &body)
  (array 'loop ()
         (cons 'when (cons pred (concat body (array (array 'recur)))))))

(defn times
  (n f)
  (let (a (make-array))
    (for-times (i n)
      (push! a (f i)))
    a))

(defn each
  (a f) (.forEach a f) a)

(defn tap
  (val f) (f val) val)

(defn print
  (x) (.log js/console x))

(defn say
  (&args)
  (.apply (.-log js/console) js/console (.map args pr-str)))

(defn p
  (x) (print (pr-str x)))

;; Assertions and Testing

(defmacro is
  ((exp)
   (array 'is exp (array 'str "Failed assertion: " (pr-str exp " is false"))))
  ((exp msg)
   (array 'begin (array 'cond (array 'not exp) (array 'throw msg)) exp)))

(defmacro is-not (body &args)
  (cons 'is (cons (array 'not body) args)))

(defmacro deftest
  (name &body)
  (let (nm (.withMeta {:test true}))
    (array 'def nm (cons 'fn (cons '() body)))))

;; OOP & JS reflection

(defn js-define-slot-value
  (obj slot-name value)
  (array-set! obj slot-name value))

(defn js-define-prototype-value
  (object slot-name value)
  (array-set! (js-prototype object) slot-name value))

(defn seal!
  (object) (.seal js/Object object))

(defn sealed?
  (object) (.isSealed js/Object object))

(defn extensible?
  (object) (.isExtensible js/Object object))

(defn prevent-extensions!
  (object) (.preventExtensions js/Object object))

(defn arity
  (f)
  (if (function? f)
    (.-length f)
    (throw (js/Error. "arity cannot be found"))))

(defn js-object
  (&kvs)
  (when (odd? (array-length kvs))
    (throw (js/Error. "key/value pairs should be even")))
  (.fromEntries js/Object (partition 2 kvs)))

(defn js-property-value
  (obj property-name)
  (array-get obj property-name))

;; Return the bound method or thow an exception
(defn method
  (obj method-name)
  (let (val (js-property-value obj method-name))
    (if (function? val)
      (.bind val obj)
      (throw (js/Error. "undefined method")))))

(defn has-method?
  (obj method)
  (function? (slot obj method)))

(defn bind
  (f object)
  (.call (.-bind (.-prototype js/Function)) f object))

(defn partial
  (f &args)
  (.apply (.-bind (.-prototype js/Function)) f (.concat [nil] args)))

;; More advanced array functions

(defn partition (n a)
  (let (pairs (array))
    (for-times (i (.floor js/Math (/ (array-length a) n)))
      (let (p (array))
        (for-times (j n)
          (array-set! p j (array-get a (+ (* n i) j))))
        (array-set! pairs i p)))
    pairs))

;; see Math.min
(defn min
  (numbers)
  (array-get (sort numbers) 0))

;; see Math.max
(defn max
  (numbers)
  (array-get (sort numbers) (- (array-length numbers) 1)))

(defn indices
  (indexed)
  (let (a (make-array))
    (for-times (i (.-length indexed))
      (push! a i))
    a))

(defn repeat
  (s n)
  (let (a (make-array))
    (for-times (i n)
      (push! a s))
    (.join a "")))

;; Maps & Sets

(defn hash-map
  (&kvs)
  (when (odd? (array-length kvs))
    (throw (js/Error. "key/value pairs should be even")))
  (js/Map. (partition 2 kvs)))

(defn set
  (col)
  (js/Set. (->array col)))

;; TODO: Add merge and merge!

;; These are polymorphic on Maps ans Sets and any other
;; object that implements the method.
(defn keys
  (map) (->array (.keys map)))

(defn values
  (map) (->array (.values map)))

(defn entries
  (map) (->array (.entries map)))

(defn size
  (map) (.-size map))

;; These are map specific
(defn add-key!
  (map key value)
  (.set map key value))

(defn key?
  (map key)
  (.call (.-has (.-prototype js/Map)) map key))

;; These are set specific
(defn add-member!
  (set member)
  (.call (.-add (.-prototype js/Set)) set member))

(defn member?
  (set member)
  (.call (.-has (.-prototype js/Set)) set member))

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
    (nil? obj) $empty-array
    (seq? obj) obj
    (seqable? obj) (.seq obj)
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
    (slot? col "add") (.add col value)
    :else
      (throw "don't know how to add a value to this collection")))

(defn add
  (col value)
  (add! (clone col) value))

(defn remove!
  (col ref)
  (cond
    (array-like? col) (begin (.splice col ref 1) col)
    (slot? col "delete") (begin (.delete col ref) col)
    :else
      (throw "don't know how to remove a value from this collection")))

(defn remove
  (col ref)
  (remove! (clone col) ref))

(defn clear!
  (col)
  (cond
    (array? col) (.splice col 0 (- (array-length col) 1))
    (slot? col "clear") (begin (.clear col) col)
    :else
      (throw (js/Error. (str "cannot clear" (pr-str col))))))

;; TODO: add alias key as meta data
(defmacro alias
  (name old)
  (array 'def name (array 'clone old)))

(def empty! clear!)

(defn empty
  (col)
  (cond
    (array-like? col) $empty-array
    (has-method? col 'empty) (.empty col)
    :else
      (empty! (clone col))))

(defn count
  (col)
  (cond
    (array-like? col) (array-length col)
    (or (map? col) (set? col)) (size col)
    (slot? col "count") (.count col)
    :else
     (reduce (fn (n _) (inc n)) col 0)))

(defn includes?
  (col value)
  (cond
    (array-like? col) (not-identical? -1 (index-of col value))
    (map? col) (key? col value)
    (set? col) (member? col value)
    (has-method? col 'includes) (.includes col value)
    :else
      (throw "can't test inclusion")))

(defn all?
  ((col)
   (all? col truthy?))
  ((col f)
   (reduce
    (fn (bool x) (and bool (f x))) col true)))

(def ^:private js-arrays-equal)

(defn =
  (a b)
  (cond
    ;; null and undefined are equal
    (and (nil? a) (nil? b)) (equiv? a b)
    ;; (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality)
    (and (js-primitive-number? a) (js-primitive-number? b))
       (or (identical? a b) (and (not-identical? a a) (not-identical? b b)))
    (and (array? a) (array? b)) (js-arrays-equal a b)
    (slot? a "equals") (.equals a b)
    (slot? b "equals") (.equals b a)
    :else
      (identical? a b)))

(defn ^:private js-arrays-equal
  (a b)
  (cond
    (not-identical? (array-length a) (array-length b)) false
    :else
      (.every a (fn (x i) (= x (array-get b i))))))


(def === isa?)

(defmacro case-with
  (pred value &conditions)
  (cons 'cond
         (.flatMap (partition 2 conditions)
               (fn (x)
                 (if (.equals :else (x 0))
                   x
                   (array (array pred (x 0) value) (x 1)))))))

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
  (.join (map #(render-form % handlers) form) ""))

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
    (nil? form) $empty-string
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
      (throw (js/Error. (str "unknown form: " (pr-str form))))))

(defn render-event-handler
  (handler)
  (let (id (handler 0)
        event (handler 1)
        cb (handler 2))
    (str "document.getElementById(" (.stringify js/JSON id) ").addEventListener("
         (.stringify js/JSON event) ", " cb ")")))

(defn render-event-handlers
  (handlers)
  (str "<script>"
       (.join (map #(render-event-handler %) handlers) ";") "</script>"))

(defn html
  (form)
  (let (event-handlers (make-array)
        content (render-form form event-handlers))
    (print event-handlers)
    (if-not (empty? event-handlers)
      (str content (render-event-handlers event-handlers))
      content)))

(defn button
  (() (button {:label "Button"}))
  ((attrs)
   (let (label   (:label attrs)
         onclick (:on-click attrs))
     [:button {:on-click onclick} label])))
