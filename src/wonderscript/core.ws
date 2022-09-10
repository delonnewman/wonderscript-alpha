; -*- mode: clojure -*-

(def array (fn* (&args) args))

(def ^:macro comment (fn* (&xs) nil))

(def assoc-array?
  (fn*
   (a)
   (cond
     (not (.isArray js/Array a))
       false
     else
       (.isArray js/Array (a 0)))))

;; TODO: collect arities to improve error message
;; TODO: add arity checking for single body forms
;; TODO: add support for multi-line bodies
(def ^:macro fn
  (fn*
   (&xs)
   (let (x (xs 0))
     (cond
       (assoc-array? x)
         (array 'fn*
                (array '&args)
                (cons 'cond
                      (.concat
                       (.flatMap xs
                                 (fn* (x)
                                      (array (array 'identical? (array-length (x 0)) (array 'array-length 'args))
                                             (array 'let
                                                    (.flatMap (x 0)
                                                              (fn* (x i)
                                                                   (cond
                                                                     (.startsWith (.name x) "&")
                                                                       (array (symbol (.slice (.name x) 1))
                                                                              (array '.slice 'args i))
                                                                     else
                                                                       (array x (array 'args i)))))
                                                    (x 1)))))
                       (array 'else
                              (array 'throw
                                     (array 'js/Error.
                                            (array 'str "wrong number of arguments, got "
                                                   (array 'array-length 'args))))))))
       else
         (cons 'fn* xs)))))

(def ^:macro defn
  (fn
    (name &rest)
    (let (doc  (cond (string? (rest 0)) (rest 0) else nil)
          meta (cond (map? (rest 0)) (rest 0) (map? (rest 1)) (rest 1) else nil)
          args (cond
                 (array? (rest 0)) (rest 0)
                 (array? (rest 1)) (rest 1)
                 (array? (rest 2)) (rest 2)
                 else (throw (js/Error. "an arglist is required")))
          body (cond
                 (and doc meta) (.slice rest 3)
                 (or doc meta) (.slice rest 2)
                 else (.slice rest 1))
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
  (let (nm (.withMeta name {:type true}))
    (array 'def nm type-val)))

(defn type?
  (sym) (:type (the-meta sym)))

(defn js-primitive-type?
  (obj) (not-identical? "object" (typeof obj)))

(defn js-primitive-number?
  (val) (identical? "number" (typeof val)))

;; primitive types

(deftype Any       'any)
(deftype Undefined 'undefined)
(deftype Null      'null)
; (deftype Nil       (union Undefined Null))
(deftype Number    'number)
(deftype String    'string)
(deftype Boolean   'boolean)
(deftype Object    'object)

(defn ==
  (a b)
  (identical? a b))

(def itself (fn (x) x))

(def always
  (fn (x)
    (fn ()
      x)))

;; Boolean & Logic

(defmacro if
  ((pred then)
   (array 'cond pred then))
  ((pred then other)
   (array 'cond pred then 'else other)))

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
    (.apply f args)))

(defn freeze!
  (object) (.freeze js/Object object))

(defn frozen?
  (object) (.isFrozen js/Object object))

(defn immutable?
  (value) (or (js-primitive-type? value) (frozen? value)))

(defn mutable?
  (value) (not (immutable? value)))

;; defconst?
(defmacro constant
  "Define a constant value this means the definition
  cannot change and the value must be immutable"
  ((name value)
   (array 'constant name nil value))
  ((name doc value)
   (let (nm (.withMeta name {:doc doc :constant true}))
     (array 'def nm
            (array 'if (array 'immutable? value)
                   value
                   (array 'throw (array 'js/Error. "only immutable values can be constants")))))))

;; defvar?
(defmacro var
  ((name value)
   (array 'var name nil value))
  ((name doc value)
   (let (nm (.withMeta name {:doc doc :variable true}))
     (array 'def nm value))))

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

(defn isa?
  (t value)
  (if (function? t)
    (instance? value t)
    (.equals (type value) t)))

;; Numerical

;; numerical constants
(constant $pi      (.-PI js/Math))
(constant $e       (.-E js/Math))
(constant $log10e  (.-LOG10e js/Math))
(constant $log2e   (.-LOG2e js/Math))
(constant $ln10    (.-LN10 js/Math))
(constant $ln2     (.-LN2 js/Math))
(constant $sqrt1-2 (.-SQRT1_2 js/Math))
(constant $sqrt2   (.-SQRT2 js/Math))

(defn ->integer
  (s) (js/parseInt s 10))

(defn ->float
  (s) (js/parseFloat s 10))

(defn add1 (x) (+ x 1))
(defn sub1 (x) (- 1 x))

(defmacro <op>
  (operator)
  (array 'fn (array 'a 'b) (array operator 'a 'b)))

(def <+> (<op> +))
(def <-> (<op> -))
(def <*> (<op> *))
(def </> (<op> /))

(defn sum
  "Take the sum of the values in the collection"
  (col) (reduce <+> col 0))

(defn product
  "Take the product of the values in the collection"
  (col) (reduce <*> col 1))

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

;; Basic Array, Strings & ArrayLike

(constant $empty-array (freeze! []))

(defn concat
  (&arrays)
  (.apply (.-concat (.-prototype js/Array)) $empty-array arrays))

(defn array?
  (object)
  (.isArray js/Array object))

(defn new-array
  (n?) (js/Array. n?))

;; TODO: will need to extend for seqs
(defn ->array
  (object)
  (.from js/Array object))

(defn array-like?
  (object)
  (and (identical? "object" (typeof object))
       (number? (.-length object))))

(defn slice
  (col start end?)
  (.slice col start end?))

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
    else 0))

(defn sort!
  (array)
  (.call (.-sort (.-prototype js/Array)) array <=>))

(defn sort
  (array)
  (sort! (clone array)))

(defn fill!
  (array value start? end?)
  (.fill array value start? end?))

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

(constant $white-space-regex (freeze! (js/RegExp. "\\s+")))
(constant $empty-string "")

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
  (.name named))

(defn namespace
  (named)
  (.namespace named))

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

(constant $ending-new-line-pattern (freeze! (js/RegExp. "(\\n|\\r\\n)$")))
(constant $new-line-pattern (freeze! (js/RegExp. "\\r\\n|\\n")))

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
                       (concat body (array (array 'recur (array 'col (array 'add1 'i)) (array 'add1 'i))))))
           col)))

(defmacro while
  (pred &body)
  (array 'loop ()
         (cons 'when (cons pred (concat body (array (array 'recur)))))))

(defn times
  (n f)
  (let (a [])
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
  (&args) (.apply (.-log js/console) js/console (.map args pr-str)))

(defn pr
  (x)
  (print (pr-str x)))

;; Assertions and Testing

(defmacro is
  ((exp)
   (array 'is (args 0) (array 'str "Failed assertion: " (pr-str (args 0) " is false"))))
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

(defn method?
  (obj method)
  (.log js/console (array-get obj method) obj method)
  (function? (array-get obj method)))

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

(defn min
  (numbers)
  (array-get (sort numbers) 0))

(defn max
  (numbers)
  (array-get (sort numbers) (- (array-length numbers) 1)))

(defn indices
  (indexed)
  (let (a [])
    (for-times (i (.-length indexed))
      (push! a i))
    a))

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
    else
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
    else
      (throw "don't know how to add a value to this collection")))

(defn add
  (col value)
  (add! (clone col) value))

(defn remove!
  (col ref)
  (cond
    (array-like? col) (begin (.splice col ref 1) col)
    (slot? col "delete") (begin (.delete col ref) col)
    else
      (throw "don't know how to remove a value from this collection")))

(defn remove
  (col ref)
  (remove! (clone col) ref))

(defn clear!
  (col)
  (cond
    (array? col) (.splice col 0 (- (array-length col) 1))
    (slot? col "clear") (begin (.clear col) col)
    else
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
    (method? 'empty) (.empty col)
    else
      (empty! (clone col))))

(defn count
  (col)
  (cond
    (array-like? col) (array-length col)
    (or (map? col) (set? col)) (size col)
    (slot? col "count") (.count col)
    else
     (reduce (fn (n _) (add1 n)) col 0)))

(defn includes?
  (col value)
  (cond
    (array-like? col) (not-identical? -1 (index-of col value))
    (map? col) (key? col value)
    (set? col) (member? col value)
    (method? col "includes") (.includes col value)
    else
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
    else
     (identical? a b)))

(defn ^:private js-arrays-equal
  (a b)
  (cond
    (not-identical? (array-length a) (array-length b)) false
    else
      (.every a (fn (x i) (= x (array-get b i))))))


(def === isa?)

(defmacro case-with
  (pred value &conditions)
  (cons 'cond
         (.flatMap (partition 2 conditions)
               (fn (x)
                 (if (.equals 'else (x 0))
                   x
                   (array (array pred (x 0) value) (x 1)))))))

(defmacro case
  (value &conditions)
  (cons 'case-with (cons '=== (cons value conditions))))

;; HTML Rendering

(defn tag?
  (x) (array? x) (string? (array-get x 0)))

(defn has-attr?
  (x) (map? (array-get x 1)))

(defn component?
  (x) (array? x) (function? (array-get x 0)))

(def tag-list? array?)

(defn render-attr
  (form)
  (reduce (fn (s x) (str s " " x))
          (map (fn (x) (str (array-get x 0) "=\"" (array-get x 1) "\""))
               (entries form))))

(def html) ; render-tag-list and html are mutually recursive

(defn render-tag-list
  (form) (.join (map html form) ""))

(defn render-attr-tag (form)
  (let (tag  (array-get form 0)
        attr (render-attr (array-get form 1)))
    (str "<" tag " " attr ">" (render-tag-list (slice form 2)) "</" tag ">")))

(defn render-tag (form)
  (let (t (array-get form 0))
    (str "<" t ">" (render-tag-list (slice form 1)) "</" t ">")))

(defn render-component (form)
  (let (f (array-get form 0)
        args (slice form 1))
    (html (apply f args))))

(defn html
  (form)
  (cond
    (nil? form) $empty-string
    (true? form) "Yes"
    (false? form) "No"
    (string? form) form
    (tag? form)
      (if (has-attr? form)
        (render-attr-tag form)
        (render-tag form))
    (component? form) (render-component form)
    (tag-list? form) (render-tag-list form)
    else
      (throw (js/Error. "Unknown form"))))
