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
  (identical? (mod x 2) 0))

(defn odd? (x)
  (identical? (mod x 2) 1))

(defn assoc-array?
  (a)
  (cond (not (array? a))
          false
        :else
          (array? (aget a 0))))

; (fn^
;   ((x) x)
;   ((x y) [x y])
;   ((x y &zs) (cons x (cons y zs))))
(defmacro func (&xs)
  (let (x (aget xs 0))
    (cond (assoc-array? x)
            ; compile multi-body fn
            (map (fn (x) (array 'identical? (.-length x) 'args)) x)
          :else
            ; single body fn
            (cons 'fn xs))))
