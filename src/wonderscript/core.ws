; -*- mode: clojure -*-

; Initial fn definition, will redefine below
; TODO: add arity checks here
(def ^:macro fn
  (fn* (args &body)
    (cons 'fn* (cons args body))))

; TODO: add optional doc string and meta data map

(def array (fn (&args) args))

(def ^:macro comment (fn (&xs) nil))

; TODO: redefine fn with multi arity bodies

(def ^:macro defn
  (fn (name args &body)
    (array 'def name (cons 'fn (cons args body)))))

(defn ==
  (a b)
  (identical? a b))

(def itself (fn (x) x))

(def always
  (fn (x)
    (fn ()
      x)))

;; Boolean & Logic

(defn ^:macro if (&args)
  (cond
    (identical? 2 (array-length args))
      (array 'cond (args 0) (args 1))
    (identical? 3 (array-length args))
      (array 'cond (args 0) (args 1) 'else (args 2))
    else
      (throw (new js/Error "Wrong number of arguments expected 2 or 3"))))

(defn ^:macro when (pred &acts)
  (array 'cond pred (cons 'begin acts)))

(defn ^:macro unless (pred &acts)
  (array 'cond (array 'not pred) (cons 'begin acts)))

(defn true?
  (x) (identical? true x))

(defn false?
  (x) (identical? false x))

(defn falsy?
  (obj) (and (identical? obj false) (nil? obj)))

(defn truthy?
  (obj) (not (falsy? obj)))

;; Numerical

(defn add1 (x) (+ x 1))
(defn sub1 (x) (- 1 x))

(defn + (&xs)
  (cond
    (identical? 0 (array-length xs))
      0
    (identical? 1 (array-length xs))
      (xs 0)
    else
      (eval (cons '+ xs))))

; TODO: improve these definitions
(defn - (a b) (- a b))
(defn * (a b) (* a b))
(defn / (a b) (/ a b))

(defn zero?
  (x) (identical? 0 x))

(defn nonzero?
  (x) (not-identical? 0 x))

(defn positive?
  (x) (< 0 x))

(defn negative?
  (x) (> 0 x))

(defn even? (x)
  (identical? (bit-and x 1) 0))

(defn odd? (x)
  (identical? (bit-and x 1) 1))

;; Basic functions and OOP

(def apply
  (fn (f args)
    (.apply f args)))

(defn freeze!
  (object) (.freeze js/Object object))

(defn frozen?
  (object) (.isFrozen js/Object object))

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

(defn type-name
  (value)
  (if (identical? "object" (typeof value))
    (js-constructor-name value)
    (typeof value)))

;; Basic Array, Strings & ArrayLike

(def $empty-array (freeze! []))

(defn concat
  (&arrays)
  (.apply (.-concat (.-prototype js/Array)) $empty-array arrays))

(defn array?
  (object)
  (.isArray js/Array object))

;; TODO: will need to extend for seqs
(defn ->array
  (object)
  (.from js/Array object))

(defn array-like?
  (object)
  (and (identical? "object" (typeof object))
       (number? (.-length object))))

(defn slice
  (col start end)
  (.slice col start end))

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

(defn reverse!
  (array)
  (unless (array? array)
    (throw (js/Error. (str "no automatic conversion of " (type-name array) " to array"))))
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

(def $white-space-regex (js/RegExp. "\\s+"))
(def $empty-string "")

(defn blank?
  (object)
  (or (nil? object) (empty? object)
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

(defn assoc-array? (a)
  (cond (not (array? a))
          false
        :else
          (array? (a 0))))

(defn mapcat
  (f coll)
  (apply concat (map f coll)))

; (fn^
;   ((x) x)
;   ((x y) [x y])
;   ((x y &zs) (cons x (cons y zs))))
(defn ^:macro fn- (&xs)
  (let (x (xs 0))
    (cond
      (assoc-array? x)
        ; compile multi-body fn
        ; TODO: collect arguments
      (array 'fn (array '&args)
             (cons 'cond
                   (mapcat (fn (x)
                             (array (array 'identical? (array-length (x 0)) 'args) (x 1))) xs)))
          else
            ; single body fn
            (cons 'fn xs))))

;; Imperative Programming

;; TODO: include let binding for macro output for better performance, will need gensym
(defn ^:macro for-times
  (bindings &body)
  (let (nm   (bindings 0)
        init (bindings 1))
    (array 'loop (array nm 0)
          (cons 'when
                (cons (array '< nm init)
                      (concat body (array (array 'recur (array '+ nm 1))))))
          init)))

(defn ^:macro for-each
  (bindings &body)
  (let (nm  (bindings 0)
        col (bindings 1))
    (array 'loop (array nm (array 'col 0) 'i 0)
           (cons 'when
                 (cons (array 'not (array 'nil? nm))
                       (concat body (array (array 'recur (array 'col (array 'add1 'i)) (array 'add1 'i))))))
           col)))

(defn ^:macro while
  (pred &body)
  (array 'loop ()
         (cons 'when (cons pred (concat body (array (array 'recur)))))))

(defn print
  (x) (.log js/console x))

(defn pr
  (x)
  (print (pr-str x)))

;; Assertions and Testing

(def $failure-tag "FAILURE: ")
(def $assertion-msg " is false")

(defn ^:macro is
  (&args)
  (cond
    (identical? 1 (array-length args))
      (array 'is (args 0)
             (array 'str
                    '$failure-tag
                    (array 'quote (pr-str (args 0)))
                    '$assertion-msg))
    (identical? 2 (array-length args))
      (array 'cond
             (array 'not (args 0)) (array 'print (args 1)))))

(defn ^:macro is-not (body &args)
  (cons 'is (cons (array 'not body) args)))

(defn ^:macro deftest
  (nm &body)
  (array 'begin
    (array 'def nm (cons 'fn (cons '() body)))
    (array 'set-meta nm ':test true)))

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

(defn js-primitive-type?
  (obj)
  (not (identical? "object" (typeof obj))))

(defn js-primitive-number?
  (val) (identical? "number" (typeof val)))

(defn arity
  (f)
  (if (function? f)
    (.-length f)
    (throw (js/Error. "arity cannot be found"))))

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

(defn sum
  (numbers)
  (reduce + numbers))

(defn product
  (numbers)
  (reduce * numbers))

(defn min
  (numbers)
  (array-get (sort numbers) 0))

(defn max
  (numbers)
  (array-get (sort numbers) (- (array-length numbers) 1)))

;; Maps & Sets

(defn hash-map
  (&kvs)
  (.log js/console kvs)
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
      (throw "don't know how to add a value to this collection")))

(defn remove
  (col ref)
  (remove! (clone col) ref))

(defn empty!
  (col) (.clear col) col)

(defn empty
  (col)
  (if (array-like? col)
    $empty-array
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
    (array-like? col) (not (identical? -1 (index-of col value)))
    (map? col) (key? col value)
    (set? col) (member? col value)
    (slot? col "includes") (.includes col value)
    else
      (throw "can't test inclusion")))

;; TODO: Implement for seqables
(defn all?
  (&args)
  (cond
    (identical? (array-length args) 1)
      (all? (array-get args 0) truthy?)
    (identical? (array-length args) 2)
      (let (f   (array-get args 0)
                col (array-get args 1))
        (reduce (fn (bool x) (and bool (f x))) col true))
    else
      (throw "wrong number of arguments expected 1 or 2")))

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
