; vim: ft=clojure

; Intial fn definition, will redefine below
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
(set-meta :doc "define a macro")
(set-meta :arglists '(name args &body))

; TODO: redefine fn with multi arity bodies

(defmacro defn (name args &body)
  (array 'def name (cons 'fn (cons args body))))

(def identity (fn (x) x))

(def constantly
  (fn (x)
    (fn ()
      x)))

(defn inc (x) (+ x 1))
(defn dec (x) (- x 1))

(defn + (&xs)
  (cond (identical? 0 (alength xs))
          0
        (identical? 1 (alength xs))
          (aget xs 0)
        :else
          (eval (cons '+ xs))))

(defn - (a b) (- a b))

(defmacro comment (&xs) nil)

(defmacro if (&args)
  (cond (identical? 2 (alength args))
          (array 'cond (aget args 0) (aget args 1))
        (identical? 3 (alength args))
          (array 'cond (aget args 0) (aget args 1) :else (aget args 2))
        :else
          (throw (new js/Error "Wrong number of arguments expected 2 or 3"))))

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
(defmacro func (&xs)
  (let (x (aget xs 0))
    (cond (assoc-array? x)
            ; compile multi-body fn
            ; TODO: collect arguments
            (array 'fn (array '&args) (cons 'cond (mapcat (fn (x) (array (array 'identical? (.-length (aget x 0)) 'args) (aget x 1))) xs)))
          :else
            ; single body fn
            (cons 'fn xs))))

(defmacro when (pred &acts)
  (array 'cond pred (cons 'do acts)))

(defmacro dotimes
  (bindings &body)
  (let (nm (aget bindings 0)
        init (aget bindings 1))
    (array 'loop (array nm 0)
          (cons 'when
                (cons (array '< nm init)
                      (concat body (array (array 'recur (array '+ nm 1))))))
          init)))

(defmacro while
  (pred &body)
  (array 'loop ()
         (cons 'when (cons pred (concat body (array (array 'recur)))))))


(defn partition (n a)
  (let (pairs (array))
    (dotimes (i (.floor js/Math (/ (alength a) n)))
      (let (p (array))
        (dotimes (j n)
          (aset p j (aget a (+ (* n i) j))))
        (aset pairs i p)))
    pairs))

(defn slice
  (a n) (.slice a n))

(defn seq (xs)
  (cond (nil? xs) []
        (array? xs) xs
        (objectliteral? xs) (.entries js/Object xs)
        :else
          (throw (js/Error. "The given value is not seqable"))))

(defn first
  (xs) (aget (seq xs) 0))

(defn second
  (xs) (aget (seq xs) 1))

(defn rest
  (xs) (.slice (seq xs) 1))

(defn nth
  (xs n) (aget (seq xs) n))

(defn true?
  (x) (identical? true x))

(defn false?
  (x) (identical? false x))

(defn zero?
  (x) (identical? 0 x))

(defn pos?
  (x) (< 0 x))

(defn neg?
  (x) (> 0 x))

(defn tag?
  (x) (array? x) (string? (aget x 0)))

(defn has-attr?
  (x) (objectliteral? (aget x 1)))

(defn component?
  (x) (array? x) (function? (aget x 0)))

(def tag-list? array?)

(defn render-attr (form)
  (reduce (fn (s x) (str s " " x))
          (map (fn (x) (str (aget x 0) "=\"" (aget x 1) "\"")) (.entries js/Object form))))

(def html) ; render-tag-list and html are mutually recursive

(defn render-tag-list
  (form) (.join (map html form) ""))

(defn render-attr-tag (form)
  (let (t (aget form 0)
        attr (render-attr (aget form 1)))
    (str "<" t " " attr ">" (render-tag-list (slice form 2)) "</" t ">")))

(defn render-tag (form)
  (let (t (aget form 0))
    (str "<" t ">" (render-tag-list (slice form 1)) "</" t ">")))

(defn render-component (form)
  (let (f (aget form 0)
        args (slice form 1))
    (html (apply f args))))

(defn html (form)
  (cond (nil? form) ""
        (true? form) "Yes"
        (false? form) "No"
        (string? form) form
        (tag? form)
          (if (has-attr? form)
            (render-attr-tag form)
            (render-tag form))
        (component? form) (render-component form)
        (tag-list? form) (render-tag-list form)
        :else
          (throw (js/Error. "Unknown form"))))

(defn pr
  (x) (print (pr-str x)))

(defn ns-map
  (ns) (.-module ns))

 (defmacro ns
   (nm) (array 'set! '(. NS -value) (array 'create-ns (array 'quote nm))))

(def failure-tag "FAILURE: ")
(def assertion-msg " is false")

(defmacro is
  (&args)
  (cond (identical? 1 (alength args))
        (array 'is (aget args 0) (array 'str 'wonderscript.core/failure-tag (array 'quote (pr-str (aget args 0))) 'wonderscript.core/assertion-msg))
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

(defn class (object)
  (.-name (.-constructor object)))
