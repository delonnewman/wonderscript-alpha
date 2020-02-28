; vim: ft=clojure
(defmacro fn (args &body)
  (cons 'fn* (cons args body)))

(defmacro defn (name args &body)
  (array 'def name (cons 'fn (cons args body))))

; TODO: one of these fail to compile statically, but work fine when compiled dynamically
(def identity (fn (x) x))

(def constantly
  (fn (x)
    (fn ()
      x)))

(defn inc (x) (+ x 1))
(defn dec (x) (- x 1))
