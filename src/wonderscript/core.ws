; -*- mode: clojure -*-

; Initial fn definition, will redefine below
; TODO: add arity checks here
(def fn
  (fn* (args &body)
    (cons 'fn* (cons args body))))
(set-macro fn)

; TODO: add optional doc string and meta data map

(def defmacro
  (fn* (name args &body)
    (array 'do
           (array 'def name (cons 'fn (cons args body)))
           (array 'set-macro name)
           name)))
(set-macro defmacro)
(set-meta defmacro :doc "define a macro")
(set-meta defmacro :arglists '(name args &body))

(defmacro comment (&xs) nil)

; TODO: redefine fn with multi arity bodies

(defmacro defn (name args &body)
  (array 'def name (cons 'fn (cons args body))))

(defn ==
  (a b)
  (identical? a b))

; TODO: Is there a preferable name less mathy perhaps what about "reflect"?
(def identity (fn (x) x))

; TODO: Should be named "always"?
(def always
  (fn (x)
    (fn ()
      x)))

;; Boolean & Logic

(defmacro if (&args)
  (cond (identical? 2 (alength args))
          (array 'cond (aget args 0) (aget args 1))
        (identical? 3 (alength args))
         (array 'cond (aget args 0) (aget args 1) :else (aget args 2))
        :else
          (throw (new js/Error "Wrong number of arguments expected 2 or 3"))))

(defn true?
  (x) (identical? true x))

(defn false?
  (x) (identical? false x))

(defn falsy?
  (obj) (and (identical? false) (nil? obj)))

(defn truthy?
  (obj) (not (falsy? obj)))

;; Numerical

(defn inc (x) (+ x 1))
(defn dec (x) (- x 1))

(defn + (&xs)
  (cond (identical? 0 (alength xs))
          0
        (identical? 1 (alength xs))
          (aget xs 0)
        :else
          (eval (cons '+ xs))))

; TODO: improve these definitions
(defn - (a b) (- a b))
(defn * (a b) (* a b))
(defn / (a b) (/ a b))

(defn zero?
  (x) (identical? 0 x))

(defn pos?
  (x) (< 0 x))

(defn neg?
  (x) (> 0 x))

(defn even? (x)
  (identical? (bit-and x 1) 0))

(defn odd? (x)
  (identical? (bit-and x 1) 1))

(defn assoc-array? (a)
  (cond (not (array? a))
          false
        :else
          (array? (aget a 0))))

(defn mapcat
  (f coll)
  (apply concat (map f coll)))

; (fn^
;   ((x) x)
;   ((x y) [x y])
;   ((x y &zs) (cons x (cons y zs))))
(defmacro fn- (&xs)
  (let (x (aget xs 0))
    (cond
      (assoc-array? x)
        ; compile multi-body fn
        ; TODO: collect arguments
      (array 'fn (array '&args)
             (cons 'cond
                   (mapcat (fn (x)
                             (array (array 'identical? (.-length (aget x 0)) 'args) (aget x 1))) xs)))
          else
            ; single body fn
            (cons 'fn xs))))

;; Imperative Programming

(defmacro when (pred &acts)
  (array 'cond pred (cons 'do acts)))

(defmacro unless (pred &acts)
  (array 'cond (array 'not pred) (cons 'do acts)))

(defmacro dotimes
  (bindings &body)
  (let (nm (aget bindings 0)
        init (aget bindings 1))
    (array 'loop (array nm 0)
          (cons 'when
                (cons (array '< nm init)
                      (concat body (array (array 'recur (array '+ nm 1))))))
          init)))

(defmacro doeach
  (bindings &body)
  (let (nm (aget bindings 0)
        col (aget bindings 1))
    (array 'loop (array nm (array 'aget col 0) 'i 0)
           (cons 'when
                 (cons (array 'not (array 'nil? nm))
                       (concat body (array (array 'recur (array 'aget col (array 'inc 'i)) (array 'inc 'i))))))
           col)))

(defmacro while
  (pred &body)
  (array 'loop ()
         (cons 'when (cons pred (concat body (array (array 'recur)))))))

(defn pr
  (x)
  (print (pr-str x)))

;; Assertions and Testing

(def $failure-tag "FAILURE: ")
(def $assertion-msg " is false")

(defmacro is
  (&args)
  (cond
    (identical? 1 (alength args))
      (array 'is (aget args 0)
             (array 'str
                    '$failure-tag
                    (array 'quote (pr-str (aget args 0)))
                    '$assertion-msg))
    (identical? 2 (alength args))
      (array 'cond
             (array 'not (aget args 0)) (array 'print (aget args 1)))))

(defmacro is-not (body &args)
  (cons 'is (cons (array 'not body) args)))

(defmacro deftest
  (nm &body)
  (array 'do
    (array 'def nm (cons 'fn (cons '() body)))
    (array 'set-meta nm ':test true)))

;; OOP & JS reflection

(defn js-constructor
  (object)
  (.-constructor object))

(defn js-prototype
  (object)
  (.getPrototypeOf js/Object object))

(defn js-constructor-name
  (object)
  (.-name (js-constructor object)))

(defn js-define-singleton-method
  (obj method-name f)
  (aset obj method-name f))

(defn js-define-prototype-method
  (object method-name f)
  (aset (js-prototype object) method-name f))

(defn freeze!
  (object) (.freeze js/Object object))

(defn frozen?
  (object) (.isFrozen js/Object object))

(defn clone
  (object)
  (if (.isArray js/Array object)
    (.slice object 0)
    (.assign js/Object (.create js/Object nil) object)))

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
  (not (identical? "object" (type obj))))

(defn js-object-tag
  (object)
  (.call (.-toString (.-prototype js/Object)) object))

(defn arity
  (f)
  (if (function? f)
    (.-length f)
    (throw (js/Error. "arity cannot be found"))))

(defn js-property-value
  (obj property-name)
  (aget obj property-name))

;; Return the bound method or thow an exception
(defn method
  (obj method-name)
  (let (val (js-property-value obj method-name))
    (if (function? val)
      (.bind val obj)
      (throw (js/Error. "undefined method")))))

(defn method?
  (obj method)
  (function? (aget obj method)))

(defn bind
  (f object)
  (.call (.-bind (.-prototype js/Function)) f object))

(defn partial
  (f &args)
  (.apply (.-bind (.-prototype js/Function)) f (.concat [nil] args)))

;; Array, Strings & ArrayLike

(def $empty-array (freeze! []))

(defn array (&args) args)

(defn array?
  (object)
  (.isArray js/Array object))

(defn array-like?
  (object)
  (and (identical? "object" (type object))
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

(defn sort!
  (array)
  (.call (.-shift (.-prototype js/Array)) array))

(defn sort
  (array)
  (sort! (clone array)))

(defn reverse!
  (array)
  (.call (.-reverse (.-prototype js/Array)) array))

(defn reverse
  (array)
  (reverse! (clone array)))

(defn ->array
  (object)
  (.from js/Array object))

(defn index-of
  (array value)
  (.call (.-indexOf (.-prototype js/Array)) array))

(defn length
  (array) (.-length array))

(defn partition (n a)
  (let (pairs (array))
    (dotimes (i (.floor js/Math (/ (alength a) n)))
      (let (p (array))
        (dotimes (j n)
          (aset p j (aget a (+ (* n i) j))))
        (aset pairs i p)))
    pairs))

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

;; Maps & Sets

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
      (and (method? obj 'first) (method? obj 'next))))

(defn seqable?
  (obj)
  (or (seq? obj) (method? obj 'seq)))

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
    (array-like? col) (do (push! col value) col)
    (map? col) (add-key! col (at value 0) (at value 1))
    (set? col) (add-member! col value)
    (method? col 'add) (.add col value)
    else
      (throw "don't know how to add a value to this collection")))

(defn add
  (col value)
  (add! (clone col) value))

(defn remove!
  (col ref)
  (cond
    (array-like? col) (do (.splice col ref 1) col)
    (method? col 'delete) (do (.delete col ref) col)
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
    (array-like? col) (length col)
    (or (map? col) (set? col)) (size col)
    (method? col 'count) (.count col)
    else
     (reduce (fn (n _) (inc n)) col 0)))

(defn includes?
  (col value)
  (cond
    (array-like? col) (not (identical? -1 (index-of col value)))
    (map? col) (key? col value)
    (set? col) (member? col value)
    (method? col 'includes) (.includes col value)
    else
      (throw "can't test inclusion")))

;; TODO: Implement for seqables
(defn all?
  (&args)
  (cond (identical? (alength args) 1) (all? (aget args 0) truthy?)
        (identical? (alength args) 2)
        (let (f   (aget args 0)
              col (aget args 1))
          (reduce (fn (bool x) (and bool (f x))) col true))
        else
          (throw "wrong number of arguments expected 1 or 2")))

;; (defn js-arrays-equal
;;   (a b)
;;   (cond
;;     (not (and (array? a) (array? b))) false
;;     (not (identical? (alength a) (alength b))) false
;;     else
;;       (do
;;         (dotimes (i (alength a))
;;           (js* (quote "if (!wonderscriopt.core._EQ_(a[i],b[i])) return false;")))
;;         (js* (quote "return true;")))))

(defn =
  (a b)
  (cond
    (and (nil? a) (nil? b)) (equiv? a b)
    (and (js-primitive-type? a) (js-primitive-type? b)) (identical? a b)
    (and (method? a 'equal) (method? b 'equal)) (.equal a b)
    else
      (throw "both values must implement equality protocol")))

;; HTML Rendering

(defn tag?
  (x) (array? x) (string? (aget x 0)))

(defn has-attr?
  (x) (map? (aget x 1)))

(defn component?
  (x) (array? x) (function? (aget x 0)))

(def tag-list? array?)

(defn render-attr
  (form)
  (reduce (fn (s x) (str s " " x))
          (map (fn (x) (str (aget x 0) "=\"" (aget x 1) "\""))
               (entries form))))

(def html) ; render-tag-list and html are mutually recursive

(defn render-tag-list
  (form) (.join (map html form) ""))

(defn render-attr-tag (form)
  (let (tag  (aget form 0)
        attr (render-attr (aget form 1)))
    (str "<" tag " " attr ">" (render-tag-list (slice form 2)) "</" tag ">")))

(defn render-tag (form)
  (let (t (aget form 0))
    (str "<" t ">" (render-tag-list (slice form 1)) "</" t ">")))

(defn render-component (form)
  (let (f (aget form 0)
        args (slice form 1))
    (html (apply f args))))

(defn html (form)
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

