; vim: ft=clojure
nil
; Intial fn definition, will redefine below
(def fn
  (fn* (args &body)
    (cons 'fn* (cons args body))))
(set-macro fn)

; TODO: add optional doc string and meta data map
; FIXME: this breaks evalMacros step in static compilation

(def defmacro
  (fn* (name args &body)
    (array 'do
           (array 'def name (cons 'fn (cons args body)))
           (array 'setMacro name)
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

(defmacro comment (&xs) nil)

(defmacro if
  (&args)
  (cond (identical? 2 (alength args))
          (array 'cond (aget args 0) (aget args 1))
        (identical? 3 (alength args))
          (array 'cond (aget args 0) (aget args 1) :else (aget args 2))
        :else
          (throw (new js/Error "Wrong number of arguments expected 2 or 3"))))
