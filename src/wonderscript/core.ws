; -*- mode: clojure -*-

(def array (fn* (&args) args))

(def array?
  (fn* (val)
    (send js/Array [:js/isArray val])))

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
     (identical? val (send js/Math [:js/round val])))))

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
      (send wonderscript.lang/Symbol [:js/intern (str (or template "sym") i)]))))

(def message-sender
  (fn* (slot)
   (fn* (obj)
    (if (and obj (send obj [:respond-to? slot]))
      (send obj slot)))))

(def name (message-sender "name"))
(def namespace (message-sender "namespace"))

(def ^:macro comment (fn* (&xs) nil))

(def ^:macro cond
  (fn*
   (&clauses)
   (if (and clauses (not-identical? 0 (send clauses :js.prop/length)))
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
      (send (send sym :name) [:js/startsWith "&"])
      false)))

(def parsed-args
  (fn* (arglist)
    (send arglist
     [:js/map
      (fn* (sym i)
        (if (splat? sym)
          {:name
           (send
            wonderscript.lang/Symbol
            [:js/intern (send (send sym :name) [:js/slice 1])])
           :order i
           :splat true}
          {:name sym
           :order i
           :splat false}))])))

(def arity-validation-forms
  (fn* (parsed argsym)
    (let (nargs (length parsed))
      (if (send parsed [:js/some #(:splat %)])
        `(> (length ~argsym) (- ~nargs 1))
        `(identical? ~nargs (length ~argsym))))))

(def let-bindings-form
  (fn* (pair argsym)
    (cons 'let
      (cons
       (send (pair 0)
        [:js/flatMap (fn* (x i)
         (if (splat? x)
           (array (send wonderscript.lang/Symbol [:js/intern (send (send x :name) [:js/slice 1])])
            `(send ~argsym [:js/slice ~i]))
           (array x `(array-get ~argsym ~i))))])
       (send pair [:js/slice 1])))))

(def ^:macro fn
  (fn* (&xs)
   (let (x (xs 0))
     (cond
       (assoc-array? x) ;; multiple arities
       (let (arglists  (map first xs)
             parsed    (map parsed-args arglists)
             arities   (send (map #(length %) arglists) [:js/sort #(cond (< %1 %2) -1 (> %1 %2) 1 :else 0)])
             splat     (send parsed [:js/some (fn* (list) (send list [:js/some #(:splat %)]))])
             arity-str (if splat (str (arities 0) " or more") (send arities [:js/join " or "]))
             argsym    (gensym "args")
             arglist   (array (send wonderscript.lang/Symbol [:js/intern (str "&" argsym)]))
             conds     (send xs
                             [:js/flatMap
                              (fn* (x i)
                                   (array (arity-validation-forms (parsed i) argsym)
                                          (let-bindings-form x argsym)))]))
         `(fn* ~arglist
               (cond ~@conds
                     :else
                     (throw (new js/Error (str "wrong number of arguments (given " (length ~argsym) ", expeced " ~arity-str ")"))))))
       :else ;; single arity
         (let (parsed    (parsed-args x)
               arity     (length x)
               splat     (send parsed [:js/some #(:splat %)])
               arity-str (if splat (str arity " or more") (str arity))
               argsym    (gensym "args")
               arglist   (array (send wonderscript.lang/Symbol [:js/intern (str "&" argsym)])))
           `(fn* ~arglist
                  (if ~(arity-validation-forms parsed argsym)
                    ~(let-bindings-form xs argsym)
                    (throw (new js/Error (str "wrong number of arguments (given " (length ~argsym) ", expected " ~arity-str ") "))))))))))

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
                 (and doc meta) (send rest [:js/slice 3])
                 (or doc meta) (send rest [:js/slice 2])
                 :else (send rest [:js/slice 1]))
          nm (send name [:js/withMeta (merge meta {:doc doc})]))
     `(def ~nm (fn ~args ~@body)))))

(defn ^:macro defmacro
  (name &rest)
  (let (nm (send name [:js/withMeta {:macro true}]))
    `(defn ~nm ~@rest)))

(defn macro?
  (sym) (:macro (the-meta sym)))

(defmacro deftype
  "Define a type alias"
  {:added 1.0}
  (name type-val)
  (let (nm (send name [:js/withMeta {:typedef true}]))
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
     (symbol? name) (send wonderscript.lang/Keyword [:js/intern (send name :name) (send name :namespace)])
     (string? name) (send wonderscript.lang/Keyword [:js/intern name])))
  ((ns name) (send wonderscript.lang/Keyword [:js/intern name ns])))

(defn symbol
  ((name)
   (cond
     (symbol? name) name
     (keyword? name) (send wonderscript.lang/Symbol [:js/intern (send name :name) (send name :namespace)])
     (string? name) (send wonderscript.lang/Symbol [:js/intern name])))
  ((ns name) (send wonderscript.lang/Symbol [:js/intern name ns])))

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
    (send f [:js/invoke args])))

(def call
  (fn (f &args)
    (send f [:js/invoke args])))

(defn freeze!
  (object) (send js/Object [:js/freeze object]))

(defn frozen?
  (object) (send js/Object [:js/isFrozen object]))

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
   (let (nm (send name [:js/withMeta {:doc doc :constant true}]))
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
   (let (nm (send name [:js/withMeta {:doc doc :dynamic true}]))
     `(def ~nm ~value))))

(defmacro var
  ((name) `(var ~name nil))
  ((name value)
   (let (nm (send name [:js/withMeta {:mutable true}]))
     (send *ctx* [:js/define nm value])
     value)))

(defmacro this-context
  () *ctx*)

(defmacro defonce
  ((name value)
   (if-not (defined? name)
     `(def ~name ~value))))

(defn clone
  (object)
  (if (send js/Array [:js/isArray object])
    (send object [:js/slice 0])
    (send js/Object [:js/assign (send js/Object [:create nil]) object])))

(defn js-object-tag
  (object)
  (send (send js/Object [:js/prop :prototype :toString]) [:js/call object]))

(defn js-prototype
  (object)
  (send js/Object [:js/getPrototypeOf object]))

(defn js-constructor
  (object)
  (send (js-prototype object) :js.prop/constructor))

(defn js-constructor-name
  (object)
  (send (js-constructor object) :js.prop/name))

(defn type
  (value)
  (if (identical? "object" (typeof value))
    (js-constructor value)
    (symbol (typeof value))))

(defn same-type?
  (a b)
  (send (type a) [:js/equals (type b)]))

(defn constructor?
  (obj)
  (and
   (function? obj)
   (send js/Object [:js/hasOwn obj "prototype"])))

(def class? constructor?)

(defn isa?
  (t value)
  (if (function? t)
    (instance? value t)
    (let (vt (type value))
      (if (and (send 'object [:js/equals t]) (class? vt))
        true
        (send vt [:js/equals t])))))

(defn make-class
  (() (make-class (fn* ()) nil))
  ((ctr) (make-class ctr nil))
  ((ctr superclass)
   (send ctr [:js/set! :prototype (send js/Object [:js/create superclass])])
   ctr))

(defn add-method
  (klass name f)
  (send (send klass :js.prop/prototype) [:js/set! name f]))

(defmacro defclass
  ((name) `(defclass ~name nil))
  ((name superclass)
   (let (nm (send name [:js/withMeta {:typedef true}]))
     `(def ~nm (make-class ~superclass)))))

;; Numerical

;; numerical constants
(defconst PI      (send js/Math :js.prop/PI))
(defconst E       (send js/Math :js.prop/E))
(defconst LOG10E  (send js/Math :js.prop/LOG10e))
(defconst LOG2E   (send js/Math :js.prop/LOG2e))
(defconst LN10    (send js/Math :js.prop/LN10))
(defconst LN2     (send js/Math :js.prop/LN2))
(defconst SQRT1-2 (send js/Math :js.prop/SQRT1_2))
(defconst SQRT2   (send js/Math :js.prop/SQRT2))

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
        arglist (array (symbol (str "&" (send args :js/name)))))
    `(fn* ~arglist
        (cond
          (identical? 0 (send ~args :js.prop/length))
          (if-not (nil? ~identity)
            ~identity
            (new js/Error "wrong number of arguments (expected at least 1 got 0)"))
          (identical? 1 (send ~args :js.prop/length))
          (if (send ~operator [:js/equals '-])
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
  (n m) (send js/Math [:js/pow n m]))

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
    (send js/Math [:js/floor (* n (send js/Math :js/random))])
    (send js/Math :random)))

(defn floor
  (n) (send js/Math [:js/floor n]))

(defn ceil
  (n) (send js/Math [:js/ceil n]))

(defn round
  ((n) (send js/Math [:js/round n]))
  ((n factor) (* factor (send js/Math [:js/round (/ n factor)]))))

;; Basic Array, Strings & ArrayLike

(defconst EMPTY-ARRAY (freeze! (array)))

(defn concat
  (&arrays)
  (send (send js/Array [:js/prop :prototype :concat]) [:js/apply EMPTY-ARRAY arrays]))

(defn prepend
  (col x)
  (if (send col [:js/applyrespond-to? :prepend])
    (send col [:js/prepend x])
    (throw (new js/Error "unknown method prepend"))))

(defn append
  (col x)
  (if (send col [:respond-to? :append])
    (send col [:js/append x])
    (throw (new js/Error "unknown method append"))))

(defn make-array
  (() (new js/Array))
  ((n) (new js/Array n)))

;; TODO: will need to extend for seqs
(defn ->array
  (obj)
  (send js/Array [:js/from obj]))

(defn array-like?
  (obj)
  (and (identical? "object" (typeof obj))
       (number? (send obj :js.prop/length))))

(defn slice
  ((col start)
   (send col [:js/slice start]))
  ((col start end)
   (send col [:js/slice start end])))

(defn at
  (col n)
  (if (< n 0)
    (send col [:js/at (+ (length col) n)])
    (send col [:js/at n])))

(defn push!
  (array value)
  (send (send js/Array [:js/prop :prototype :push]) [:js/call array value]))

(defn pop!
  (array)
  (send (send js/Array [:js/prop :prototype :pop]) [:js/call array]))

(defn unshift!
  (array value)
  (send (send js/Array [:js/prop :prototype :unshift]) [:js/call array value]))

(defn shift!
  (array)
  (send (send js/Array [:js/prop :prototype :shift]) [:js/call array]))

(defn <=>
  (a b)
  (cond
    (< a b) -1
    (> a b) 1
    (send a [:respond-to? :cmp]) (send a [:js/cmp b])
    (send b [:respond-to? :cmp]) (send b [:js/cmp a])
    :else 0))

(defn sort!
  (array)
  (send (send js/Array [:js/prop :prototype :sort]) [:js/call array <=>]))

(defn sort
  (array)
  (sort! (clone array)))

(defn fill!
  ((array value)
   (send array [:js/fill value]))
  ((array value start)
   (send array [:js/fill value start]))
  ((array value start end)
   (send array [:js/fill value start end])))

(defn reverse!
  (array)
  (unless (array? array)
    (throw (new js/Error (str "no automatic conversion of " (type array) " to array"))))
  (send (send js/Array [:js/prop :prototype :reverse]) [:js/call array]))

(defn reverse
  (col)
  (if (array? col)
    (reverse! (clone col))
    (reverse! (->array col))))

(defn index-of
  (array value)
  (send (send js/Array [:js/prop :prototype :indexOf]) [:js/call array value]))

(defn length
  (array) (send array :js.prop/length))

;; Strings

(defvar $white-space-regex (freeze! (new js/RegExp "\\s+")))
(defconst EMPTY-STRING "")

(defn blank?
  (object)
  (or (nil? object) (zero? (length object))
      (and (string? object)
           (identical? 0 (send (send object [:js/replace $white-space-regex ""]) :js.prop/length)))))

(defn present?
  (object)
  (not (blank? object)))

(defn presence
  (object)
  (if (blank? object)
    nil
    object))

(defn trim
  (s) (send s :js/trim))

(defn trim-leading
  (s) (send s :js/trimStart))

(defn trim-trailing
  (s) (send s :js/trimEnd))

(defn starts-with?
  (s ch)
  (if (or (keyword? s) (symbol? s))
    (send (name s) [:js/startsWith ch])
    (send s [:js/startsWith ch])))

(defn ends-with?
  (s ch)
  (if (or (keyword? s) (symbol? s))
    (send (name s) [:js/endsWith ch])
    (send s [:js/endsWith ch])))

(defvar $ending-new-line-pattern (freeze! (new js/RegExp "(\\n|\\r\\n)$")))
(defvar $new-line-pattern (freeze! (new js/RegExp "\\r\\n|\\n")))

(defn chomp
  (s) (send s [:js/replace $ending-new-line-pattern ""]))

(defn lines
  (s) (send s [:js/replace $new-line-pattern]))

(defn chop
  (s) (send s [:js/slice 0 (- (length s) 1)]))

(defn chr
  (ch)
  (if (number? ch)
    (send js/String [:js/fromCodePoint ch])
    (send js/String [:js/fromCodePoint (->integer ch)])))

(defn chrs
  (array)
  (send (send array [:js/map #(chr %)]) [:js/join ""]))

(defn upcase
  (s) (send s :js/toUpperCase))

(defn downcase
  (s) (send s :js/toLowerCase))

(defn capitalize
  (s)
  (str
   (send (send s [:js/at 0]) :js/toUpperCase)
   (send s [:js/slice 1 (send s :js.prop/length)])))

(defn words
  (s) (send s [:js/split $white-space-regex]))

(defn titlecase
  (s) (send (send (words s) [:js/map #(capitalize %)]) [:js/join " "]))

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
     (send ~obj [:respond-to? :set]) (send ~obj [:js/set ~key ~value])
     (object? ~obj) (send ~obj [:js/set! ~key ~value])
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
  (a f) (send a [:js/forEach f]) a)

(defn tap
  (val f) (f val) val)

(defn print
  (x) (send js/console [:js/log x]))

(defn say
  (&args)
  (apply
   (send js/console :js.prop/log)
   (send (send args [:js/map pr-str]) [:js/join ""])))

(defn p
  (x) (print (pr-str x)))

;; Assertions and Testing

(defmacro is
  ((exp)
   `(is ~exp (str "Failed assertion: " (pr-str ~exp " is false"))))
  ((exp msg)
   `(begin (cond (not ~exp) (throw ~msg)) ~exp)))

(defmacro is-not
  ((exp) `(is (not ~exp)))
  ((exp msg) `(is (not ~exp) ~msg)))

(defmacro deftest
  (name &body)
  (let (nm (send name [:js/withMeta {:test true}]))
    `(def ~nm (fn () ~@body))))

;; OOP & JS reflection

(defn js-define-slot-value
  (obj slot-name value)
  (array-set! obj slot-name value))

(defn js-define-prototype-value
  (object slot-name value)
  (array-set! (js-prototype object) slot-name value))

(defn seal!
  (object) (send js/Object [:js/seal object]))

(defn sealed?
  (object) (send js/Object [:js/isSealed object]))

(defn extensible?
  (object) (send js/Object [:js/isExtensible object]))

(defn prevent-extensions!
  (object) (send js/Object [:js/preventExtensions object]))

; TODO: support compiler generated functions
(defn arity
  (f)
  (if (function? f)
    (send f :js.prop/length)
    (throw (new js/Error "arity cannot be found"))))

(defn js-object
  (() (send js/Object [:js/create nil]))
  ((&kvs)
   (if (odd? (length kvs))
     (throw (new js/Error "key/value pairs should be even"))
     (send js/Object [:js/fromEntries (partition 2 kvs)]))))

(defn js-property-value
  (obj property-name)
  (array-get obj property-name))

;; Return the bound method or throw an exception
(defn method
  (obj method-name)
  (let (val (js-property-value obj method-name))
    (if (function? val)
      (send val [:js/bind obj])
      (throw (new js/Error "undefined method")))))

(defn bind
  (f object)
  (send (send js/Function [:js/prop :prototype :bind]) [:js/call f object]))

(defn partial
  (f &args)
  (send
   (send js/Function [:js/prop :prototype :bind])
   [:js/apply f (send (array nil) [:js/concat args])]))

;; More advanced array functions

(defn partition (n a)
  (let (pairs (array))
    (for-times (i (send js/Math [:js/floor (/ (length a) n)]))
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
    (for-times (i (send indexed :js.prop/length))
      (push! a i))
    a))

(defn repeat
  (s n)
  (let (a (make-array))
    (for-times (i n)
      (push! a s))
    (send a [:js/join ""])))

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
   (let (entries (send y :js/entries))
     (send
      entries
      [:js/forEach
       (fn* (pair)
         (send x [:js/set (pair 0) (pair 1)]))])
     x))
  ((x y &zs)
   (merge! x y)
   (send
    zs
    [:js/forEach
     (fn* (m)
       (merge! x m))])
   x))

;; These are polymorphic on Maps ans Sets and any other
;; object that implements the method.
(defn keys
  (map) (->array (send map :js/keys)))

(defn values
  (map) (->array (send map :js/values)))

(defn entries
  (map) (->array (send map :js/entries)))

(defn size
  (map) (send map :js.prop/size))

;; These are map specific
(defn add-key!
  (map key value)
  (send map [:js/set key value]))

(defn key?
  (map key)
  (send (send js/Map [:js/prop :prototype :has]) [:js/call map key]))

;; These are set specific
(defn add-member!
  (set member)
  (send (send js/Set [:js/prop :prototype :add]) [:js/call set member]))

(defn member?
  (set member)
  (send (send js/Set [:js/prop :prototype :has]) [:js/call set member]))

;; Seq & Seqable

(defn seq?
  (obj)
  (or (nil? obj) (array? obj) (map? obj) (set? obj)
      (and (send obj [:respond-to? :first]) (send obj [:respond-to? :next]))))

(defn seqable?
  (obj)
  (or (seq? obj) (send obj [:respond-to? :seq])))

(defn seq
  (obj)
  (cond
    (nil? obj) EMPTY-ARRAY
    (seq? obj) obj
    (seqable? obj) (send obj :js/seq)
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
    (send col [:respont-o? :add]) (send col [:js/add value])
    :else
      (throw "don't know how to add a value to this collection")))

(defn add
  (col value)
  (add! (clone col) value))

(defn remove!
  (col ref)
  (cond
    (array? col) (begin (send col [:js/splice ref 1]) col)
    (send col [:respond-to? :delete]) (begin (send col [:js/delete ref]) col)
    :else
      (throw "don't know how to remove a value from this collection")))

(defn remove
  (col ref)
  (remove! (clone col) ref))

(defn clear!
  (col)
  (cond
    (array? col) (send col [:js/splice 0])
    (send col [:respond-to? :clear]) (begin (send col :js/clear) col)
    :else
      (throw (str "cannot clear" (pr-str col)))))

;; TODO: add alias key as meta data
(defmacro alias
  (name old)
  `(def ~name (clone ~old)))

(def empty! clear!)

(defn empty
  (col)
  (cond
    (array-like? col) EMPTY-ARRAY
    (send col [:respond-to? :empty]) (send col :js/empty)
    :else
      (empty! (clone col))))

(defn count
  (col)
  (cond
    (array-like? col) (length col)
    (or (map? col) (set? col)) (size col)
    (send col [:respond-to? :count]) (send col :js/count)
    :else
     (reduce (fn (n _) (inc n)) col 0)))

(defn includes?
  (col value)
  (cond
    (array-like? col) (not-identical? -1 (index-of col value))
    (map? col) (key? col value)
    (set? col) (member? col value)
    (send col [:respond-to? :includes]) (send col [:js/includes value])
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
    (and (js-primitive-type? a) (js-primitive-type? b)) (identical? a b)
    (send a [:respond-to? :equals]) (send a [:js/equals b])
    (send b [:respond-to? :equals]) (send b [:js/equals a])
    :else
      (identical? (hash-code a) (hash-code b))))

(def === isa?)

(defmacro case-with
  (pred value &conditions)
  (cons 'cond
         (send (partition 2 conditions)
               [:js/flatMap
                (fn* (x)
                 (if (send :else [:js/equals (x 0)])
                   x
                   (array (array pred (x 0) value) (x 1))))])))

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
  (send (map #(render-form % handlers) form) [:js/join ""]))

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
    (str "document.getElementById(" (send js/JSON [:js/stringify id]) ").addEventListener("
         (send js/JSON [:js/stringify event]) ", " (compile (array 'fn* (array) cb)) ")")))

(defn render-event-handlers
  (handlers)
  (str "<script>"
       (send (map #(render-event-handler %) handlers) [:js/join ";"]) "</script>"))

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
