; vim: ft=clojure

; Intial fn definition, will redefine below
(def fn
  (fn* (args &body)
    (cons 'fn* (cons args body))))
(setMacro fn)

; TODO: add optional doc string and meta data map

(def defmacro
  (fn* (name args &body)
    (array 'do
           (array 'def name (cons 'fn (cons args body)))
           (array 'setMacro name)
           name)))
(setMacro defmacro)
(setMeta :doc "define a macro")
(setMeta :arglists '(name args &body))

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

(defn add (&xs)
  (cond (identical? 0 (alength xs))
          0
        (identical? 1 (alength xs))
          (aget xs 0)
        :else
          (eval (cons '+ xs))))

(defn sub (a b) (- a b))

(defmacro comment (&xs) nil)

(defmacro if
  (&args)
  (cond (identical? 2 (alength args))
          (array 'cond (aget args 0) (aget args 1))
        (identical? 3 (alength args))
          (array 'cond (aget args 0) (aget args 1) :else (aget args 2))
        :else
          (throw (new js/Error "Wrong number of arguments expected 2 or 3"))))
